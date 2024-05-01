## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

### Chapter 5 | Navigating Between Pages

Link는 a와 달리 전체 페이지 새로고침 없이 SPA처럼 동작할 수 있게함.
Next는 route segment 별로 자동으로 code spliting을 함.
React에서 페이지에 lazy 걸었던 것과 같음
React는 code spliting 직접 안할 시 초기 로드시에 전체 코드 로딩함.

---

## Chapter 11 | Adding Search and Pagination

`searchParams`: 서버 컴포넌트에서 라우트 참조하고자 할 때, 인자로 받아올 수 있음
`useSearchParams`: 클라이언트에서 쿼리파라미터 참조하고자 할 때 훅으로 접근
`usePathname`: 클라이언트에서 라우트 참조하고자 할 때 훅으로 접근
`useRouter`: 프로그래마틱 라우팅

`use-debounce`: 디바운싱 간단하게 처리하는 라이브러리

데이터 패칭과(서버 액션 아님!! 서버 액션은 클라이언트 폼 제출에 의해 데이터 뮤테이션을 위해 서버 컴포넌트 혹은 클라이언트 컴포넌트에서 트리거 됐었고, 공식문서에서 '데이터 패칭'은 그냥 페이지 렌더링 시 실행되는 일종의 get) 클라이언트 컴포넌트로 페이지네이션 구현. 코드 참고하면 좋을듯

## Chapter 12 | Mutating data

서버 액션으로 create, update, delete 해봄.

데이터 뮤테이션을 반영하기 위한 라우터 캐시 제어 에 대해 다룸.

redirect로 서버 측 라우팅.

서버 컴포넌트는 쿼리 파라미터를 가져오는 `searchParams` 외에도
동적 파라미터를 가져오는 `params`를 참조할 수 있음.

## Chapter 13 | Error handling

`error.tsx` `not-found.tsx` 파일 작성
`error.tsx` 는 error 객체와 reset 메소드를 인자로 받을 수 있음.

## Chapter 14 | Improving accessibility

웹 접근성 향상을 위한 next lint에 대해 간단하게 다룸

useFormState로 form valid 과정에서 error 처리 보강.

## Chapter 15 | Adding Authentication

`Next auth`와 `middleware`로 인증 구현
Vercel 에서도 env로 시크릿 키 잡아줘야 프로덕션에서 auth 동작함.

미들웨어에서 인증을 처리할 경우, 인증이 확인되기 전까지 페이지 렌더링이 시작조차 하지 않기 때문에,
성능과 보안 면에서 이점이 있음.
페이지 내에서 직접 인증을 확인하고 처리하는 것과 비교해서 생각.
react에서 `axios`의 `interceptor`를 사용했던 것도 생각.

`middleware`를 모듈식으로 구성하기 위해 `auth.config.ts` 파일 작성.
`auth.config.ts`: 미들웨어에서 유저 인증 여부에 따른 리다이렉트 처리 로직

Node.js API에 의존하는 `bcrypt`를 미들웨어의 edge runtime에서 실행할 수 없으므로 인증 검증을 위해 `auth.ts` 분리해서 작성.
`auth.ts`: DB에 유저 쿼리를 보내고 비밀번호 매칭 확인하는 로직, signIn, signOut, auth를 export 함.

`action.ts`: signIn 메소드를 formData를 인자로 주며 호출하고 에러 핸들링만 함.

`login-form` `sideNav`: action 부착. sideNav에서 inline으로 server action 콜백 다는 것도 한 번 볼 것.

`useFormStatus()`로 form의 pending 여부에 따른 ui도 처리해줬음.

## Chapter 16 | Adding Metadata

### Config-based

`layout.tsx`에서 정적 메타, 동적 메타 export

### File-based

예약된 파일명들이 있음. 해당 파일명 사용 시 Next가 자체적으로 metadata로 만듦. 자세한 건 문서 참고.

OG images: 동적 OG 이미지 만들고 싶다면 ImageResponse 생성자 활용
