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

데이터 패칭과(서버 액션 아님!! 서버 액션은 클라이언트 폼 제출에 의해 데이터 뮤테이션을 위해 트리거 됐었고, 공식문서에서 '데이터 패칭'은 그냥 페이지 렌더링 시 실행되는 일종의 get) 클라이언트 컴포넌트로 페이지네이션 구현. 코드 참고하면 좋을듯
