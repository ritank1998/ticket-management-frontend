import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PropTypes from "prop-types";

const Breadcrumb = ({ prevPageName, prevPageLink }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (prevPageLink) navigate(prevPageLink);
    else navigate(-1);
  };

  return (
    <div
      className="d-flex align-items-center gap-2 py-2 px-3 shadow-sm"
      style={{
        backgroundColor: "#F8FAFC",
        borderRadius: "0.5rem",
        cursor: "pointer",
        maxWidth: "fit-content",
      }}
      onClick={handleBack}
    >
      <ArrowLeft size={20} color="#1E3A8A" />
      <span className="fw-semibold text-primary mb-0">{prevPageName}</span>
    </div>
  );
};

Breadcrumb.propTypes = {
  prevPageName: PropTypes.string.isRequired,
  prevPageLink: PropTypes.string,
};

export default Breadcrumb;
