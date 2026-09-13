import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-southeast-1_ja2e0nNWH",
      userPoolClientId: "2k2sn46m0dr4i4jt36b5i2lrq2",
      signUpVerificationMethod: "code",
      loginWith: {
        email: true,
        username: true,
      },
    },
  },
});