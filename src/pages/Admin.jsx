import React from 'react';
import { useTranslation } from 'react-i18next';

const Admin = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <h1 className="text-4xl font-bold text-[#2c3968]">Admin Dashboard</h1>
      <p className="text-[#2c3968] mt-2">Admin panel coming soon...</p>
    </div>
  );
};

export default Admin;
