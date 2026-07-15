export default function GridShape() {
  return (
    <>
      <div className="absolute right-0 top-0 -z-1 w-full max-w-[350px] xl:max-w-[600px] opacity-80">
        <img src="/images/shape/grid-01.svg" alt="" />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[350px] rotate-180 xl:max-w-[600px] opacity-80">
        <img src="/images/shape/grid-01.svg" alt="" />
      </div>
    </>
  );
}
