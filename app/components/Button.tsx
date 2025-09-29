import { Link } from "react-router";

export type ButtonProps = {
  children: string;
  onClick?: () => void;
};

export const Button = ({ children, onClick }: ButtonProps) => {
  return (
    <Link
      to="/resident"
      onClick={onClick}
      className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      {children}
      <svg
        className="ml-2 w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </Link>
  );
};
