import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) return false;
      switch (true) {
        case req.nextUrl.pathname.startsWith("/profile"):
          if (token.id === req.nextUrl.pathname.split("/")[2]) return true;
          else return false;
        default:
          return false;
      }
    },
  },
});

export const config = { matcher: ["/profile/:userId"] };
