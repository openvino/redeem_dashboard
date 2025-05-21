import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import useProfile from '@/hooks/useProfile';
import { useRouter } from 'next/router';
import { getSession, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import useWineries from '@/hooks/useWineries';
import { ToastContainer, toast } from 'react-toastify';
import clientAxios from '@/config/clientAxios';

const addUser = () => {
  const { profile, session, status } = useProfile();
  const { register, handleSubmit, setValue } = useForm();
  const router = useRouter();
  const { t } = useTranslation();

  const { wineries } = useWineries();

  const [loading, setLoading] = useState();

  const onSubmit = async (data) => {
    const toastId = toast(t('Updating winery data...'), {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
      isLoading: true,
    });
    try {
      const response = await clientAxios.post('/adminRoute', { data });
      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.SUCCESS,
        render: 'Admin created success',
        autoClose: 5000,
      });
    } catch (error) {
      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.ERROR,
        render: 'Error ' + error.response.data.message,
        autoClose: 5000,
      });
      console.log(error);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    if (status !== 'loading') {
      if (!session.is_admin && profile) {
        setValue('winery_id', profile.winery_id, { shouldDirty: false });
        setValue('is_admin', false, { shouldDirty: false });
      }
    }
  }, [session, profile]);

  return (
    <>
      <Head>
        <title>Openvino - Admin</title>
      </Head>
      <div className="flex ">
        <Sidebar />
        <Topbar />

        <ToastContainer />
        <div className="z-1 mt-[10rem] ml-[6rem] w-full overflow-x-scrolllg: overflow-x-hidden">
          <div className="">
            <form
              className=" p-2 space-y-2 flex flex-col bg-[#F1EDE2] w-[99%] border-solid rounded-xl border-gray-200 border-2"
              onSubmit={handleSubmit(onSubmit)}
            >
              <h1 className="text-xl font-bold text-center mb-4">
                {t('add_admin')}
              </h1>
              <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
                <div className="flex items-center">
                  <label className="w-24 font-bold">{t('clave')}</label>
                  <input
                    required
                    type="text"
                    id="id"
                    name="id"
                    {...register('id')}
                    className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-24 font-bold">{t('nombre')}:</label>
                  <input
                    required
                    type="text"
                    id="name"
                    name="name"
                    {...register('name')}
                    className="w-64 px-2 py-1 disabled:bg-gray-200 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
                <div className="flex items-center">
                  <label className="w-24 font-bold">{t('apellido')}</label>
                  <input
                    required
                    type="text"
                    id="last_name"
                    name="last_name"
                    {...register('last_name')}
                    className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-24 font-bold">Email:</label>
                  <input
                    required
                    type="text"
                    id="email"
                    name="email"
                    {...register('email')}
                    className="w-64 px-2 py-1 disabled:bg-gray-200 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
                <div className="flex items-center">
                  <label className="w-24 font-bold">{t('imagenPerfil')}</label>
                  <input
                    required
                    type="text"
                    id="profile_img"
                    name="profile_img"
                    {...register('profile_img')}
                    className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                  />
                </div>

                {profile?.is_admin === true ? (
                  <div className="flex items-center">
                    <label className="w-24 font-bold">{t('bodega')}</label>

                    <select
                      className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                      name="winery_id"
                      id="winery_id"
                      {...register('winery_id')}
                    >
                      <option>{t('select')}</option>

                      {wineries &&
                        wineries.map((element, index) => (
                          <option key={index} value={element.id}>
                            {element.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex justify-center w-[22rem] "></div>
                )}
              </div>

              {profile?.is_admin === true && (
                <div className="flex lg:flex-row flex-col w-full justify-center gap-3 md:gap-10 ">
                  <div className="flex items-center">
                    <label className="w-24 font-bold">{t('es_admin')}</label>

                    <select
                      className="w-64 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200"
                      name="is_admin"
                      id="is_admin"
                      {...register('is_admin')}
                    >

                      <option>{t('select')}</option>
                      <option value="true">{t('SI')}</option>
                      <option value="false">No</option>

                    </select>
                  </div>

                  <div className="flex justify-center w-[22rem] "></div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    router.back();
                  }}
                  className="px-4 py-2  bg-gray-300 text-gray-800 rounded-md"
                >
                  {t('volver')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 ml-4 bg-[#840C4A] text-white rounded-md"
                >
                  {t('guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
}

export default addUser;
