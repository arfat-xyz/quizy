export interface IFormSuccessProps {
  message?: string;
}
export interface IFormSuccessProps {
  message?: string;
}

export interface ICardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  title: string;
  showSocial?: boolean;
  forgotPasswordHref?: string; // Add this line
  forgotPasswordLabel?: string; // Add this line
}

export interface IBackButtonProps {
  label: string;
  href: string;
}

export interface IHeaderProps {
  label: string;
  title: string;
}
