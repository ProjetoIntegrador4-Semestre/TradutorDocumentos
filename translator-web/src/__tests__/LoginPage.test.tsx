import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

describe("LoginPage", () => {
  it("renderiza título e formulário", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Senha")).toBeInTheDocument();
  });

  it("mostra erro quando email vazio é enviado", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const btn = screen.getByRole("button", { name: /^entrar$/i });
    fireEvent.click(btn);

    // Espera uma mensagem de erro exibida pelo componente
    expect(await screen.findByText(/não foi possível/i)).toBeInTheDocument();
  });
});
