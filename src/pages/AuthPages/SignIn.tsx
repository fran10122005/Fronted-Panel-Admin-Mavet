import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="MAVET | Panel de Administración"
        description="Panel administrativo del MAVET"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
