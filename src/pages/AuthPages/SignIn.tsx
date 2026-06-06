import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function SignIn() {
  const { token, isLoading } = useAuth();

  if (!isLoading && token) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageMeta
        title="MAVET | Panel de Administracion"
        description="Panel administrativo del MAVET"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
