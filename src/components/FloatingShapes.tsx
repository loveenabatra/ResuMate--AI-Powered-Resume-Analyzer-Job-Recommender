export const FloatingShapes = () => {
  return (
    <>
      <div className="absolute w-64 h-64 bg-primary/10 rounded-full top-20 right-10 animate-float blur-3xl" />
      <div className="absolute w-48 h-48 bg-secondary/10 rounded-full bottom-32 left-10 animate-float blur-3xl" style={{ animationDelay: '2s' }} />
      <div className="absolute w-32 h-32 bg-primary/10 rounded-full top-1/2 left-1/4 animate-float blur-3xl" style={{ animationDelay: '4s' }} />
    </>
  );
};
