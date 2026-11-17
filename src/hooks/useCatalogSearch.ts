import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { api, posterUrl, type MediaSearchItem } from "../data/api";
import { describe } from "../data/home";
import type { ConnState, MediaCardData } from "../types";

const POSTER_WIDTH = 400;

function toCard(item: MediaSearchItem): MediaCardData {
  const meta = [item.year ? String(item.year) : null, item.type || null].filter(Boolean).join(" · ");
  return {
    id: item.itemId,
    title: item.title,
    meta: meta || null,
    poster: item.posterUrl ?? posterUrl(item.itemId, POSTER_WIDTH),
    rating: item.rating,
    local: true,
  };
}

export interface CatalogSearch {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  state: ConnState;
  message: string | null;
  items: MediaCardData[];
  total: number;
  retry: () => void;
}

/** 统一检索：空查询不发请求；防抖后取 /v1/search。 */
export function useCatalogSearch(): CatalogSearch {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<ConnState>("empty");
  const [message, setMessage] = useState<string | null>(null);
  const [items, setItems] = useState<MediaCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [nonce, setNonce] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    const text = query.trim();
    if (!text) {
      setState("empty");
      setMessage(null);
      setItems([]);
      setTotal(0);
      return;
    }
    const id = ++seq.current;
    setState("loading");
    const timer = window.setTimeout(() => {
      api
        .search(text, 20)
        .then((page) => {
          if (seq.current !== id) return;
          const list = (page.items ?? []).map(toCard);
          setItems(list);
          setTotal(page.count ?? list.length);
          setState(list.length ? "ok" : "empty");
          setMessage(null);
        })
        .catch((error: unknown) => {
          if (seq.current !== id) return;
          const result = describe(error);
          setState(result.state);
          setMessage(result.message);
          setItems([]);
          setTotal(0);
        });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [query, nonce]);

  return {
    query,
    setQuery,
    state,
    message,
    items,
    total,
    retry: () => setNonce((value) => value + 1),
  };
}
