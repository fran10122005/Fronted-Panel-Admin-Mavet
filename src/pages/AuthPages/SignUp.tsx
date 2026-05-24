import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="MAVET | Panel de Administración"
        description="Panel administrativo del MAVET"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
