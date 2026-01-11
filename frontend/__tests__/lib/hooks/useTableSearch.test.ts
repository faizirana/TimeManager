/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useTableSearch } from "@/lib/hooks/useTableSearch";

interface TestData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const mockData: TestData[] = [
  { id: 1, name: "Alice", email: "alice@test.com", role: "admin" },
  { id: 2, name: "Bob", email: "bob@test.com", role: "user" },
  { id: 3, name: "Charlie", email: "charlie@test.com", role: "manager" },
  { id: 4, name: "David", email: "david@test.com", role: "user" },
];

describe("useTableSearch", () => {
  it("should initialize with empty search query", () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["name", "email"], 0));

    expect(result.current.searchQuery).toBe("");
  });

  it("should return all data when search query is empty", () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["name", "email"], 0));

    expect(result.current.filteredData).toEqual(mockData);
  });

  it("should filter data by name without debounce", () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["name", "email"], 0));

    act(() => {
      result.current.setSearchQuery("Alice");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe("Alice");
  });

  it("should filter data by email without debounce", () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["name", "email"], 0));

    act(() => {
      result.current.setSearchQuery("bob@test");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].email).toBe("bob@test.com");
  });

  it("should be case insensitive", () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["name"], 0));

    act(() => {
      result.current.setSearchQuery("ALICE");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe("Alice");
  });

  it("should search across multiple fields", () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["name", "role"], 0));

    act(() => {
      result.current.setSearchQuery("admin");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].role).toBe("admin");
  });

  it("should return multiple matches", () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["role"], 0));

    act(() => {
      result.current.setSearchQuery("user");
    });

    expect(result.current.filteredData).toHaveLength(2);
  });

  it("should debounce search query", async () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["name"], 300));

    act(() => {
      result.current.setSearchQuery("Alice");
    });

    // Immediately after setting, filtered data should still be all data
    expect(result.current.filteredData).toEqual(mockData);

    // After debounce delay, filtered data should be updated
    await waitFor(
      () => {
        expect(result.current.filteredData).toHaveLength(1);
      },
      { timeout: 400 },
    );

    expect(result.current.filteredData[0].name).toBe("Alice");
  });

  it("should handle empty results", () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["name"], 0));

    act(() => {
      result.current.setSearchQuery("NonExistent");
    });

    expect(result.current.filteredData).toHaveLength(0);
  });

  it("should clear search results", () => {
    const { result } = renderHook(() => useTableSearch<TestData>(mockData, ["name"], 0));

    act(() => {
      result.current.setSearchQuery("Alice");
    });

    expect(result.current.filteredData).toHaveLength(1);

    act(() => {
      result.current.setSearchQuery("");
    });

    expect(result.current.filteredData).toEqual(mockData);
  });
});
