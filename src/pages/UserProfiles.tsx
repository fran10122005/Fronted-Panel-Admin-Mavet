import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import { mavetApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function UserProfiles() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { updateUser } = useAuth();

  const fetchProfile = async () => {
    try {
      const data = await mavetApi.getMe();
      setProfile(data?.usuario);
      if (data?.usuario && updateUser) {
        updateUser(data.usuario);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <>
      <PageMeta
        title="MAVET || Panel Admin"
        description="Este es un panel administrativo para el MAVET"
      />
      <PageBreadcrumb pageTitle="Mi Perfil" />
      <div className="space-y-6">
        <UserMetaCard profile={profile} onRefresh={fetchProfile} />
        {loading ? (
          <div className="text-center text-gray-500 py-10">Cargando perfil...</div>
        ) : (
          <UserInfoCard profile={profile} onRefresh={fetchProfile} />
        )}
      </div>
    </>
  );
}
