import { renderHook, act } from "@testing-library/react";
import { useTableSort } from "@/lib/hooks/useTableSort";

interface TestUser {
  name: string;
  age: number;
  role: string;
}

describe("useTableSort", () => {
  const mockData: TestUser[] = [
    { name: "Charlie", age: 30, role: "Developer" },
    { name: "Alice", age: 25, role: "Designer" },
    { name: "Bob", age: 35, role: "Manager" },
  ];

  it("should initialize with provided data", () => {
    const { result } = renderHook(() => useTableSort(mockData));
    expect(result.current.data).toEqual(mockData);
    expect(result.current.sortColumn).toBeNull();
    expect(result.current.sortDirection).toBeNull();
  });

  it("should sort strings in ascending order", () => {
    const { result } = renderHook(() => useTableSort(mockData));

    act(() => {
      result.current.handleSort("name");
    });

    expect(result.current.data[0].name).toBe("Alice");
    expect(result.current.data[1].name).toBe("Bob");
    expect(result.current.data[2].name).toBe("Charlie");
    expect(result.current.sortColumn).toBe("name");
    expect(result.current.sortDirection).toBe("asc");
  });

  it("should sort strings in descending order on second click", () => {
    const { result } = renderHook(() => useTableSort(mockData));

    act(() => {
      result.current.handleSort("name");
    });

    act(() => {
      result.current.handleSort("name");
    });

    expect(result.current.data[0].name).toBe("Charlie");
    expect(result.current.data[1].name).toBe("Bob");
    expect(result.current.data[2].name).toBe("Alice");
    expect(result.current.sortColumn).toBe("name");
    expect(result.current.sortDirection).toBe("desc");
  });

  it("should sort numbers in ascending order", () => {
    const { result } = renderHook(() => useTableSort(mockData));

    act(() => {
      result.current.handleSort("age");
    });

    expect(result.current.data[0].age).toBe(25);
    expect(result.current.data[1].age).toBe(30);
    expect(result.current.data[2].age).toBe(35);
    expect(result.current.sortColumn).toBe("age");
    expect(result.current.sortDirection).toBe("asc");
  });

  it("should sort numbers in descending order on second click", () => {
    const { result } = renderHook(() => useTableSort(mockData));

    act(() => {
      result.current.handleSort("age");
    });

    act(() => {
      result.current.handleSort("age");
    });

    expect(result.current.data[0].age).toBe(35);
    expect(result.current.data[1].age).toBe(30);
    expect(result.current.data[2].age).toBe(25);
    expect(result.current.sortColumn).toBe("age");
    expect(result.current.sortDirection).toBe("desc");
  });

  it("should reset to ascending when switching columns", () => {
    const { result } = renderHook(() => useTableSort(mockData));

    act(() => {
      result.current.handleSort("name");
    });

    act(() => {
      result.current.handleSort("name");
    });

    expect(result.current.sortDirection).toBe("desc");

    act(() => {
      result.current.handleSort("age");
    });

    expect(result.current.sortDirection).toBe("asc");
    expect(result.current.sortColumn).toBe("age");
  });

  it("should use custom comparison function when provided", () => {
    const { result } = renderHook(() => useTableSort(mockData));

    const customCompare = (a: TestUser, b: TestUser) => {
      // Sort by role length
      return a.role.length - b.role.length;
    };

    act(() => {
      result.current.handleSort("role", customCompare);
    });

    expect(result.current.data[0].role).toBe("Manager"); // 7 chars
    expect(result.current.data[1].role).toBe("Designer"); // 8 chars
    expect(result.current.data[2].role).toBe("Developer"); // 9 chars
  });

  it("should reverse custom comparison in descending order", () => {
    const { result } = renderHook(() => useTableSort(mockData));

    const customCompare = (a: TestUser, b: TestUser) => {
      return a.role.length - b.role.length;
    };

    act(() => {
      result.current.handleSort("role", customCompare);
    });

    act(() => {
      result.current.handleSort("role", customCompare);
    });

    expect(result.current.data[0].role).toBe("Developer"); // 9 chars
    expect(result.current.data[1].role).toBe("Designer"); // 8 chars
    expect(result.current.data[2].role).toBe("Manager"); // 7 chars
    expect(result.current.sortDirection).toBe("desc");
  });

  it("should handle empty data array", () => {
    const { result } = renderHook(() => useTableSort<TestUser>([]));

    expect(result.current.data).toEqual([]);
    expect(result.current.sortColumn).toBeNull();
    expect(result.current.sortDirection).toBeNull();

    act(() => {
      result.current.handleSort("name");
    });

    expect(result.current.data).toEqual([]);
  });

  it("should use localeCompare for string sorting", () => {
    const specialCharsData: TestUser[] = [
      { name: "Élise", age: 30, role: "Developer" },
      { name: "Alice", age: 25, role: "Designer" },
      { name: "Zoé", age: 35, role: "Manager" },
    ];

    const { result } = renderHook(() => useTableSort(specialCharsData));

    act(() => {
      result.current.handleSort("name");
    });

    expect(result.current.data[0].name).toBe("Alice");
    expect(result.current.data[1].name).toBe("Élise");
    expect(result.current.data[2].name).toBe("Zoé");
  });

  it("should not modify original data array", () => {
    const originalData = [...mockData];
    const { result } = renderHook(() => useTableSort(mockData));

    act(() => {
      result.current.handleSort("name");
    });

    expect(mockData).toEqual(originalData);
  });

  it("should handle third click on same column (asc again)", () => {
    const { result } = renderHook(() => useTableSort(mockData));

    act(() => {
      result.current.handleSort("name");
    });

    expect(result.current.sortDirection).toBe("asc");

    act(() => {
      result.current.handleSort("name");
    });

    expect(result.current.sortDirection).toBe("desc");

    act(() => {
      result.current.handleSort("name");
    });

    // After desc, it should go back to asc (not toggle back to desc)
    expect(result.current.sortDirection).toBe("asc");
  });
});
