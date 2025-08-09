const Logo = () => {
  return (
    <div className="flex p-5 justify-start items-center gap-4">
      <div className="relative drop-shadow-2xl">
        <svg
          width="50"
          height="50"
          viewBox="0 0 40 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 10C5 7.23858 7.23858 5 10 5H25C27.7614 5 30 7.23858 30 10V18C30 20.7614 27.7614 23 25 23H15L10 28V23H10C7.23858 23 5 20.7614 5 18V10Z"
            fill="#3b82f6"
          />
          <path
            d="M12 18C12 15.2386 14.2386 13 17 13H32C34.7614 13 37 15.2386 37 18V26C37 28.7614 34.7614 31 32 31H22L17 36V31H17C14.2386 31 12 28.7614 12 26V18Z"
            fill="#3b82f6"
            className="opacity-25"
          />

          <circle cx="15" cy="14" r="2" fill="#ffffff" className="opacity-90" />
          <circle cx="20" cy="14" r="2" fill="#ffffff" className="opacity-90" />
          <circle cx="25" cy="14" r="2" fill="#ffffff" className="opacity-90" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Pro<span className="text-blue-300">Chat</span>
        </span>
      </div>
    </div>
  );
};

export default Logo;
