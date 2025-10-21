import { useEffect } from "react";

const GenericModal = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose} // close when clicking outside the modal
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center relative"
        onClick={(e) => e.stopPropagation()} // prevent close on modal click
      >
        <h2 className="text-lg font-semibold mb-4">{message}</h2>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default GenericModal;
