"use client";

interface DownloadButtonProps {
  filePath: string;
  fileName: string;
  children: React.ReactNode;
}

const DownloadButton = ({ filePath, fileName, children }: DownloadButtonProps) => {
  return (
    <button
      onClick={() => {
        const link = document.createElement("a");
        link.href = filePath;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:scale-105 transition-transform"
    >
      {children}
    </button>
  );
};
export default DownloadButton