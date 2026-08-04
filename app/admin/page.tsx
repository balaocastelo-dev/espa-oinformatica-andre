"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  FileUp,
  LayoutGrid,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { Product } from "@/lib/format";
import type { Category } from "@/lib/store";
import type { CompanySettings } from "@/lib/company";

type Tab = "products" | "categories" | "company";
type CompanyTextField = Exclude<keyof CompanySettings, "logoPath" | "stats" | "services">;

type ProductFormState = {
  name: string;
  price: string;
  image: string;
  category: string;
  badge: string;
  description: string;
  specs: string;
  product_url: string;
  image_urls: string;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  price: "",
  image: "",
  category: "",
  badge: "",
  description: "",
  specs: "",
  product_url: "",
  image_urls: "",
};

function specsToText(specs?: Record<string, string>): string {
  if (!specs) return "";
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function textToSpecs(text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // corpo vazio ou resposta não-JSON (ex.: timeout do servidor)
    data = null;
  }
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Erro na requisição (status ${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filter, setFilter] = useState("");

  const refresh = useCallback(async () => {
    const [prods, cats] = await Promise.all([
      api<Product[]>("/api/products"),
      api<Category[]>("/api/categories"),
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  const notify = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const filteredProducts = products.filter((p) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-[#E60012]"
              aria-label="Voltar à loja"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black">Painel Administrativo</h1>
              <p className="text-xs text-slate-500">
                Gerencie produtos e categorias da loja
              </p>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#E60012] sm:flex"
          >
            Ver loja
            <ExternalLink size={14} />
          </Link>
        </div>

        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {(
            [
              { key: "products", label: "Produtos", icon: Package },
              { key: "categories", label: "Categorias", icon: LayoutGrid },
              { key: "company", label: "Empresa", icon: Building2 },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-bold transition ${
                tab === key
                  ? "border-[#E60012] text-[#E60012]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {message && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${
              message.type === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-slate-500">Carregando...</div>
        ) : tab === "products" ? (
          <ProductsPanel
            products={filteredProducts}
            total={products.length}
            categories={categories}
            filter={filter}
            setFilter={setFilter}
            refresh={refresh}
            notify={notify}
          />
        ) : tab === "categories" ? (
          <CategoriesPanel
            categories={categories}
            products={products}
            refresh={refresh}
            notify={notify}
          />
        ) : (
          <CompanyPanel notify={notify} />
        )}
      </div>
    </div>
  );
}

function ProductsPanel({
  products,
  total,
  categories,
  filter,
  setFilter,
  refresh,
  notify,
}: {
  products: Product[];
  total: number;
  categories: Category[];
  filter: string;
  setFilter: (v: string) => void;
  refresh: () => Promise<void>;
  notify: (type: "ok" | "err", text: string) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Excluir o produto "${product.name}"?`)) return;
    try {
      await api(`/api/products/${product.id}`, { method: "DELETE" });
      notify("ok", "Produto excluído");
      await refresh();
    } catch (e) {
      notify("err", (e as Error).message);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {total} produto{total === 1 ? "" : "s"} · exibindo {products.length}
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-auto">
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar produtos..."
              className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 pl-9 text-sm outline-none focus:border-[#E60012] sm:w-52"
            />
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#E60012] px-4 py-2 text-sm font-bold text-white hover:bg-red-700 sm:w-auto"
          >
            <Plus size={16} />
            Novo produto
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-[#E60012] hover:text-[#E60012] sm:w-auto"
          >
            <FileUp size={16} />
            Importar em lote
          </button>
        </div>
      </div>

      {importOpen && (
        <ImportModal
          onCancel={() => setImportOpen(false)}
          onDone={async (msg) => {
            notify("ok", msg);
            setImportOpen(false);
            await refresh();
          }}
          onError={(msg) => notify("err", msg)}
        />
      )}

      {(formOpen || editing) && (
        <ProductForm
          initial={editing}
          categories={categories}
          onCancel={closeForm}
          onSaved={async (msg) => {
            notify("ok", msg);
            closeForm();
            await refresh();
          }}
          onError={(msg) => notify("err", msg)}
        />
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Selo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 flex-none rounded-lg border border-slate-200 bg-slate-50 object-contain p-1"
                    />
                    <span className="line-clamp-2 max-w-xs font-medium">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {product.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold">{product.price}</td>
                <td className="px-4 py-3">
                  {product.badge ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {product.badge}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setEditing(product)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#E60012]"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-slate-400">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({
  initial,
  categories,
  onCancel,
  onSaved,
  onError,
}: {
  initial: Product | null;
  categories: Category[];
  onCancel: () => void;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [form, setForm] = useState<ProductFormState>(() =>
    initial
      ? {
          name: initial.name,
          price: initial.price,
          image: initial.image,
          category: initial.category,
          badge: initial.badge ?? "",
          description: initial.description ?? "",
          specs: specsToText(initial.specs),
          product_url: initial.product_url ?? "",
          image_urls: (initial.image_urls ?? []).join("\n"),
        }
      : { ...EMPTY_FORM, category: categories[0]?.name ?? "" }
  );
  const [saving, setSaving] = useState(false);

  const set = (field: keyof ProductFormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return onError("Informe o nome do produto");
    if (!form.price.trim()) return onError("Informe o preço");

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: form.price,
        image: form.image,
        category: form.category,
        badge: form.badge,
        description: form.description,
        specs: textToSpecs(form.specs),
        product_url: form.product_url,
        image_urls: linesToArray(form.image_urls),
      };
      if (initial) {
        await api(`/api/products/${initial.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        onSaved("Produto atualizado");
      } else {
        await api("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onSaved("Produto criado");
      }
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#E60012] focus:bg-white";
  const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-black">
          {initial ? "Editar produto" : "Novo produto"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
            placeholder="Ex.: Usado - Notebook Dell Latitude 7480"
          />
        </div>
        <div>
          <label className={labelClass}>Preço *</label>
          <input
            type="text"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className={inputClass}
            placeholder="1.899,00"
          />
        </div>
        <div>
          <label className={labelClass}>Categoria</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>URL da imagem</label>
          <input
            type="text"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>URL do anúncio original (Kabum)</label>
          <input
            type="text"
            value={form.product_url}
            onChange={(e) => set("product_url", e.target.value)}
            className={inputClass}
            placeholder="https://www.kabum.com.br/produto/..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Galeria de fotos (uma URL por linha, sem cortar)
          </label>
          <textarea
            value={form.image_urls}
            onChange={(e) => set("image_urls", e.target.value)}
            rows={3}
            className={inputClass}
            placeholder={"https://.../foto1.jpg\nhttps://.../foto2.jpg\nhttps://.../foto3.jpg"}
          />
        </div>
        <div>
          <label className={labelClass}>Selo (opcional)</label>
          <input
            type="text"
            value={form.badge}
            onChange={(e) => set("badge", e.target.value)}
            className={inputClass}
            placeholder="Ex.: Seminovo"
          />
        </div>
        <div>
          <label className={labelClass}>Descrição</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass}
            placeholder="Descrição curta do produto"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Especificações (uma por linha, no formato{" "}
            <code className="text-slate-400">Chave: Valor</code>)
          </label>
          <textarea
            value={form.specs}
            onChange={(e) => set("specs", e.target.value)}
            rows={4}
            className={inputClass}
            placeholder={"Processador: Intel Core i5\nMemória: 8GB\nTela: 14\""}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-full bg-[#E60012] px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Salvando..." : initial ? "Salvar alterações" : "Criar produto"}
        </button>
      </div>
    </form>
  );
}

function CategoriesPanel({
  categories,
  products,
  refresh,
  notify,
}: {
  categories: Category[];
  products: Product[];
  refresh: () => Promise<void>;
  notify: (type: "ok" | "err", text: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const countFor = (name: string) =>
    products.filter((p) => p.category === name).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: newName }),
      });
      setNewName("");
      notify("ok", "Categoria criada");
      await refresh();
    } catch (err) {
      notify("err", (err as Error).message);
    }
  };

  const handleRename = async (category: Category) => {
    try {
      await api(`/api/categories/${category.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: renameValue }),
      });
      notify("ok", "Categoria renomeada");
      setRenamingId(null);
      await refresh();
    } catch (err) {
      notify("err", (err as Error).message);
    }
  };

  const handleDelete = async (category: Category) => {
    const count = countFor(category.name);
    const msg =
      count > 0
        ? `Excluir "${category.name}"? ${count} produto(s) serão movidos para "Outras Marcas".`
        : `Excluir "${category.name}"?`;
    if (!confirm(msg)) return;
    try {
      await api(`/api/categories/${category.id}`, { method: "DELETE" });
      notify("ok", "Categoria excluída");
      await refresh();
    } catch (err) {
      notify("err", (err as Error).message);
    }
  };

  const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form
        onSubmit={handleAdd}
        className="h-fit rounded-2xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-base font-black">Nova categoria</h2>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Ex.: Acer"
          className="mt-3 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#E60012]"
        />
        <button
          type="submit"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#E60012] px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700"
        >
          <Plus size={16} />
          Adicionar categoria
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((category) => {
              const renaming = renamingId === category.id;
              return (
                <tr
                  key={category.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    {renaming ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        autoFocus
                        className="rounded-lg border border-[#E60012] bg-white px-2.5 py-1.5 text-sm outline-none"
                      />
                    ) : (
                      <span className="font-semibold">{category.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {countFor(category.name)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {renaming ? (
                        <>
                          <button
                            onClick={() => handleRename(category)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setRenamingId(null)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setRenamingId(category.id);
                            setRenameValue(category.name);
                          }}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#E60012]"
                          title="Renomear"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(category)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompanyPanel({
  notify,
}: {
  notify: (type: "ok" | "err", text: string) => void;
}) {
  const [form, setForm] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    api<CompanySettings>("/api/settings")
      .then(setForm)
      .catch((error) => notify("err", (error as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const updateText = (field: CompanyTextField, value: string) => {
    setForm((previous) => (previous ? { ...previous, [field]: value } : previous));
  };

  const updateStat = (index: number, field: "value" | "label", value: string) => {
    setForm((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        stats: previous.stats.map((stat, currentIndex) =>
          currentIndex === index ? { ...stat, [field]: value } : stat
        ),
      };
    });
  };

  const updateService = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    setForm((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        services: previous.services.map((service, currentIndex) =>
          currentIndex === index ? { ...service, [field]: value } : service
        ),
      };
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const saved = await api<CompanySettings>("/api/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setForm(saved);
      notify("ok", "Informações da empresa salvas");
    } catch (error) {
      notify("err", (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const selectLogo = (file: File | undefined) => {
    if (!file) return;
    const extension = file.name.toLowerCase().split(".").pop();
    const detectedType =
      file.type ||
      (extension === "png"
        ? "image/png"
        : extension === "jpg" || extension === "jpeg"
          ? "image/jpeg"
          : extension === "webp"
            ? "image/webp"
            : "");
    if (!["image/png", "image/jpeg", "image/webp"].includes(detectedType)) {
      notify("err", "Formato inválido. Use PNG, JPG ou WEBP");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    try {
      const body = new FormData();
      body.append("logo", logoFile);
      const response = await fetch("/api/settings/logo", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as CompanySettings | { error?: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error || "Erro ao enviar o logo" : "Erro ao enviar o logo");
      }
      setForm(data as CompanySettings);
      setLogoFile(null);
      setLogoPreview(null);
      notify("ok", "Logo atualizado");
    } catch (error) {
      notify("err", (error as Error).message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#E60012] focus:bg-white";
  const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500";

  if (loading) {
    return <div className="py-24 text-center text-slate-500">Carregando configurações...</div>;
  }

  if (!form) {
    return <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">Não foi possível carregar as configurações.</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black">Ajustes da empresa</h2>
          <p className="mt-1 text-sm text-slate-500">
            Altere a identidade, os contatos e os textos exibidos na loja.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E60012] px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-black">Identidade e contatos</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nome da empresa</label>
            <input value={form.name} onChange={(e) => updateText("name", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slogan / subtítulo</label>
            <input value={form.tagline} onChange={(e) => updateText("tagline", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefone exibido</label>
            <input value={form.phoneDisplay} onChange={(e) => updateText("phoneDisplay", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>WhatsApp (somente números)</label>
            <input value={form.whatsappNumber} onChange={(e) => updateText("whatsappNumber", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => updateText("email", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Instagram</label>
            <input value={form.instagramHandle} onChange={(e) => updateText("instagramHandle", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Link do Instagram</label>
            <input type="url" value={form.instagramUrl} onChange={(e) => updateText("instagramUrl", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Endereço</label>
            <input value={form.address} onChange={(e) => updateText("address", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <input value={form.city} onChange={(e) => updateText("city", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <input value={form.region} onChange={(e) => updateText("region", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>CEP</label>
            <input value={form.postalCode} onChange={(e) => updateText("postalCode", e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-black">Logo da empresa</h3>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-slate-100 p-3">
            <img
              src={logoPreview || form.logoPath}
              alt={`Logo de ${form.name}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="min-w-0 space-y-2">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => selectLogo(event.target.files?.[0])}
              className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
            />
            <p className="text-xs text-slate-500">PNG, JPG ou WEBP, até 5 MB. O logo será usado no Header e Footer.</p>
            <button
              type="button"
              onClick={uploadLogo}
              disabled={!logoFile || uploadingLogo}
              className="flex min-h-10 items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-[#E60012] hover:text-[#E60012] disabled:opacity-50"
            >
              <Upload size={15} />
              {uploadingLogo ? "Enviando..." : "Aplicar novo logo"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-black">Textos principais da página</h3>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={labelClass}>Selo do destaque</label>
            <input value={form.heroBadge} onChange={(e) => updateText("heroBadge", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Título principal</label>
            <textarea rows={2} value={form.heroTitle} onChange={(e) => updateText("heroTitle", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descrição principal</label>
            <textarea rows={3} value={form.heroDescription} onChange={(e) => updateText("heroDescription", e.target.value)} className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Texto do botão WhatsApp</label>
              <input value={form.heroWhatsappLabel} onChange={(e) => updateText("heroWhatsappLabel", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Texto do botão catálogo</label>
              <input value={form.catalogButtonLabel} onChange={(e) => updateText("catalogButtonLabel", e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Mensagem do botão principal do WhatsApp</label>
            <textarea rows={2} value={form.heroWhatsappMessage} onChange={(e) => updateText("heroWhatsappMessage", e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-black">Estatísticas do destaque</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {form.stats.map((stat, index) => (
            <div key={index} className="grid grid-cols-[96px_1fr] gap-2">
              <input
                value={stat.value}
                onChange={(e) => updateStat(index, "value", e.target.value)}
                className={inputClass}
                placeholder="15+"
                aria-label={`Valor da estatística ${index + 1}`}
              />
              <input
                value={stat.label}
                onChange={(e) => updateStat(index, "label", e.target.value)}
                className={inputClass}
                placeholder="Descrição"
                aria-label={`Descrição da estatística ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-black">Serviços</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Título da seção</label>
            <input value={form.servicesTitle} onChange={(e) => updateText("servicesTitle", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descrição da seção</label>
            <textarea rows={2} value={form.servicesDescription} onChange={(e) => updateText("servicesDescription", e.target.value)} className={inputClass} />
          </div>
          {form.services.map((service, index) => (
            <div key={index} className="space-y-2 rounded-xl bg-slate-50 p-3">
              <input
                value={service.title}
                onChange={(e) => updateService(index, "title", e.target.value)}
                className={inputClass}
                placeholder="Título do serviço"
              />
              <textarea
                rows={3}
                value={service.description}
                onChange={(e) => updateService(index, "description", e.target.value)}
                className={inputClass}
                placeholder="Descrição do serviço"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-black">Rodapé, atendimento e chamada final</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Título da chamada final</label>
            <input value={form.ctaTitle} onChange={(e) => updateText("ctaTitle", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descrição da chamada final</label>
            <textarea rows={2} value={form.ctaDescription} onChange={(e) => updateText("ctaDescription", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Texto do botão final</label>
            <input value={form.ctaButtonLabel} onChange={(e) => updateText("ctaButtonLabel", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mensagem padrão do WhatsApp</label>
            <input value={form.whatsappDefaultMessage} onChange={(e) => updateText("whatsappDefaultMessage", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descrição do rodapé</label>
            <textarea rows={3} value={form.footerDescription} onChange={(e) => updateText("footerDescription", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Horário de segunda a sexta</label>
            <input value={form.weekdayHours} onChange={(e) => updateText("weekdayHours", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Horário de sábado</label>
            <input value={form.saturdayHours} onChange={(e) => updateText("saturdayHours", e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#E60012] px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto"
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function ImportModal({
  onCancel,
  onDone,
  onError,
}: {
  onCancel: () => void;
  onDone: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file, "utf-8");
  };

  const itemCount = text
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("http")).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return onError("Cole ou envie um arquivo com os produtos");
    setBusy(true);
    try {
      const data = await api<{
        imported?: number;
        skipped?: number;
        total?: number;
        enriched?: number;
      }>("/api/products/import", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      onDone(
        `${data?.imported ?? 0} produto(s) importado(s), ${data?.skipped ?? 0} ignorado(s). Total no catálogo: ${data?.total ?? 0}.`
      );
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white p-4 shadow-xl sm:p-5"
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-black">Importar produtos em lote</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Cole ou envie um arquivo .txt / .tsv com colunas separadas por tab:{" "}
              <span className="font-semibold text-slate-700">
                URL do produto · URL da imagem · Nome · Preço
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#E60012] hover:text-[#E60012]">
            <FileUp size={15} />
            Escolher arquivo
            <input
              type="file"
              accept=".txt,.tsv,.csv,.xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
          {fileName && (
            <span className="max-w-full break-all text-xs font-semibold text-emerald-600">{fileName}</span>
          )}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          spellCheck={false}
          placeholder={"https://www.kabum.com.br/produto/1042683/usado-notebook...\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1042683/medium/foto.png\tUsado - Notebook Dell Latitude E5470\t1.840,00"}
          className="mt-3 min-h-48 w-full flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-relaxed outline-none focus:border-[#E60012] focus:bg-white"
        />

        <div className="mt-3 flex flex-col items-start gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <span>
            {itemCount > 0
              ? `${itemCount} item(ns) detectado(s)`
              : "Nenhum item detectado ainda"}
          </span>
          <span className="break-words">Ao importar, fotos em alta resolução e galeria são baixadas do link original.</span>
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 rounded-full bg-[#E60012] px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto"
          >
            {busy ? "Importando... isso pode levar ~1 min" : "Importar produtos"}
          </button>
        </div>
      </form>
    </div>
  );
}
