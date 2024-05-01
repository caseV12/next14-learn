//Node.js API에 의존하는 bcryt를 edge runtime에서 실행할 수 없으므로 인증 검증을 위해 파일 분리
import { authConfig } from '@/auth.config';
import { sql } from '@vercel/postgres';
import NextAuth from 'next-auth';
import credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { User } from './lib/definitions';

/** db에서 유저 칼럼에서 email로 매치되는 유저 한명 가져오는 함수 */
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('유저 패치 실패', error);
    throw new Error('Failed to fetch user');
  }
}

/** credentials 방식으로 DB에 유저 쿼리, 비밀번호 매칭 확인 후 DB의 유저 정보를 반환하는 함수*/
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  //authConfig 객체 스프레드 하고, provider 프로퍼티는 재정의
  providers: [
    credentials({
      async authorize(credentials) {
        console.log(credentials);
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(5) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          console.log(passwordsMatch);
          if (passwordsMatch) return user;
        }

        console.log('유효하지 않은 자격증명');
        return null;
      },
    }),
  ],
});
