const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 60"
      width="200"
      height="60"
    >
      {/* <!-- Chat bubble icon --> */}
      <path
        d="M 15 20 Q 15 12 22 12 L 38 12 Q 45 12 45 20 L 45 28 Q 45 35 38 35 L 28 35 L 22 40 L 22 35 Q 15 35 15 28 Z"
        fill="none"
        stroke="#104e64"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* <!-- Text: ChatVior --> */}
      <text
        x="55"
        y="38"
        fontFamily="Arial, sans-serif"
        fontSize="28"
        fontWeight="600"
        fill="#1e293b"
        letterSpacing="-0.5"
      >
        ChatVior
      </text>
    </svg>
  );
};

export default Logo;
