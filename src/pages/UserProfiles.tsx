import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import { mavetApi } from "../services/api";

export default function UserProfiles() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await mavetApi.getMe();
      setProfile(data?.usuario);
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
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Perfil de Usuario
        </h3>
        <div className="space-y-6">
          <UserMetaCard profile={profile} />
          {loading ? (
            <div className="text-center text-gray-500">Cargando perfil...</div>
          ) : (
            <UserInfoCard profile={profile} onRefresh={fetchProfile} />
          )}
          <UserAddressCard />
        </div>
      </div>
    </>
  );
}
