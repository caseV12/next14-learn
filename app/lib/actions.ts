'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
// 유효성 검증용 폼 스키마를 데이터베이스 스키마와 명확하게 일치하게 정의하고,
// omit 메소드로 실제 폼에서 받지 않는 값은 제외함.

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
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
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
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

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
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
