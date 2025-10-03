import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer bg-dark text-center text-white py-4 mt-5">
      <div className="container">
        <p className="mb-0">
          <small className="text-white-50">
            © {new Date().getFullYear()} Techorzo-Mind. All Rights Reserved.
          </small>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
