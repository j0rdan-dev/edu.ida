const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>© {currentYear} EDU.IDA. Сите права се задржани.</p>
      </div>
    </footer>
  );
};

export default Footer;
