import { useRouter } from "next/router";

function Detail() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Hola</h1>
    </div>
  );
}

export default Detail;
