'use server';

import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { signIn } from '../auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: 'customer를 지정해주세요' }),
  amount: z.coerce.number().gt(0, { message: '$0 이상 값을 입력해주세요' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'invoice의 상태를 선택해주세요',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
// 유효성 검증용 폼 스키마를 데이터베이스 스키마와 명확하게 일치하게 정의하고,
// omit 메소드로 실제 폼에서 받지 않는 값은 제외함.

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  console.log(formData);
  //서버 쪽 콘솔(터미널)에 찍힘
  // const rawFormData = {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };

  //아래는 코드는 짧지만 시각적으로 폼 내부를 볼 수 없음
  //const rawFormData = Object.fromEntries(formData.entries()) 도 가능.

  //zod의 parse 메소드나 safeParseAsync 메소드에 인자로 rawFormdata 넘기고 parse된 값 받아옴.
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  console.log(validatedFields);

  //유효성 검사 통과 못할지 에러 객체 넣어서 early return
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '유효하지 않은 입력 필드. Invoice 생성 실패.',
    };
  }

  // safeParse 객체의 success 프로퍼티 확인 후 실제로 DB에 넣을 값 구조분해 할당.
  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  //프리스마를 쓸 땐 아래 부분에서 date를 안잡아도 알아서 프리스마 클라이언트와
  //프리스마의 schema 파일에 의해 생성된 sql문이 처리함
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  //해당 라우터의 캐시를 지워서(client-side 라우트 캐시는 다 지우고 server-side 라우트 캐시(full page cache와 동일)는 해당 경로만 지움)
  //다음에 해당 경로 방문할 때 서버 측에 새로운 페이지 요청하게 되고, 서버는 데이터 패치 다시하면서 업데이트 된 데이터로 렌더링함.
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '유효하지 않은 입력 필드. Invoice 생성 실패.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
  //아니 근데 이러면 Table 하나 지웠다고 해당 페이지 전체를 서버에서 다시 render 하는 거 아닌가?
  //생각보다 느려. 한 번 알아봐야 할 듯. 근데 이건 어쩔 수 없나.
}

/** formData를 받아서 NextAuth의 signIn 메소드에 넘기고 에러 핸들링만 하는 함수.
 * 유저 쿼리와 비밀번호 매칭은 signIn 메소드 내에서 이루어진다.
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    //NextAuth 함수가 리턴하는 signIn 메소드는 providers 종류를 인자로 받는 로그인 함수 제공
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return '유효하지 않은 계정 정보입니다';
        default:
          return '뭔가 잘못됨';
      }
    }
    throw error; //authError 외의 에러 처리
  }
}
