/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "@/components/UI/LoadingState";

describe("LoadingState", () => {
  it("should render children when not loading", () => {
    render(
      <LoadingState isLoading={false}>
        <div>Test content</div>
      </LoadingState>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
  });

  it("should render loading indicator when loading", () => {
    render(
      <LoadingState isLoading={true}>
        <div>Test content</div>
      </LoadingState>,
    );

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
  });

  it("should render custom fallback when specified", () => {
    render(
      <LoadingState isLoading={true} fallback={<div>Custom fallback</div>}>
        <div>Test content</div>
      </LoadingState>,
    );

    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
  });

  it("should render skeleton when specified", () => {
    render(
      <LoadingState isLoading={true} skeleton={<div>Skeleton UI</div>}>
        <div>Test content</div>
      </LoadingState>,
    );

    expect(screen.getByText("Skeleton UI")).toBeInTheDocument();
    expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
  });

  it("should show loading spinner element", () => {
    const { container } = render(
      <LoadingState isLoading={true}>
        <div>Test content</div>
      </LoadingState>,
    );

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should center loading content", () => {
    const { container } = render(
      <LoadingState isLoading={true}>
        <div>Test content</div>
      </LoadingState>,
    );

    const loadingContainer = container.querySelector(".flex");
    expect(loadingContainer).toHaveClass("flex");
    expect(loadingContainer).toHaveClass("justify-center");
    expect(loadingContainer).toHaveClass("items-center");
  });
});
