import { useEffect, useState } from "react";

export default function useRemote(load) {
  const [state, setState] = useState(null);
  useEffect(() => {
    load()
      .then((response) => setState(response.data))
      .catch(() => setState(false));
  }, [load]);
  return state;
}