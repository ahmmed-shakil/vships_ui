import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import SignInForm from '@/app/signin/sign-in-form';
import UnderlineShape from '@/components/shape/underline';
import { metaObject } from '@/config/site.config';
import Image from 'next/image';

export const metadata = {
  ...metaObject('Sign In'),
};

export default function SignIn() {
  return (
    <AuthWrapperOne
      title={
        <>
          Welcome to Perfomax! Please{' '}
          <span className="relative inline-block">
            Sign in to
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue md:w-28 xl:-bottom-1.5 xl:w-36" />
          </span>{' '}
          continue.
        </>
      }
      description="By signing in, you will gain access to to the management and monitoring of your vessel."
      bannerTitle="The simplest way to manage your vessel."
      bannerDescription="Manage and monitor your vessel with ease."
      isSocialLoginActive={false}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[400px] xl:w-[520px] 2xl:w-[620px]">
          <Image
            src={
              'https://isomorphic-furyroad.s3.amazonaws.com/public/auth/sign-up.webp'
            }
            alt="Sign Up Thumbnail"
            fill
            priority
            sizes="(max-width: 768px) 100vw"
            className="object-cover"
          />
        </div>
      }
    >
      <SignInForm />
    </AuthWrapperOne>
  );
}
