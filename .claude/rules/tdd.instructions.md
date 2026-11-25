---
applyTo: '**/*'
---

# Test-Driven Development (TDD) Principles - AI Instructions

## Core TDD Workflow

1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass test
3. **REFACTOR**: Improve code while maintaining test pass

## Mandatory Rules

### Test-First Discipline

- NEVER write production code without failing test
- Test describes expected behavior before implementation
- Watch test fail before writing implementation
- Verify test passes after implementation

### Minimal Implementation

- Write ONLY code needed to pass current test
- Avoid premature optimization
- Resist implementing features without tests
- Each test drives one specific behavior

### Test Quality Standards

- Tests must be deterministic (same input = same output)
- Tests should be independent (no execution order dependency)
- Use descriptive test names explaining expected behavior
- One assertion concept per test (arrange, act, assert)

## Test Structure Pattern

```typescript
describe('UnitUnderTest', () => {
  // Arrange: Setup test data and mocks
  const input = validInput();
  const expected = expectedOutput();

  // Act: Execute function/method
  const result = functionUnderTest(input);

  // Assert: Verify result matches expectation
  expect(result).toEqual(expected);
});
```

## Code Coverage Requirements

- Aim for 100% line coverage
- 100% branch coverage (all if/else paths)
- 100% function coverage
- Use Istanbul/c8 for coverage reporting
- Uncovered code indicates missing tests

## Anti-Patterns to Avoid

### Do NOT

- Write implementation before test
- Write multiple tests before implementation
- Skip watching test fail
- Test implementation details instead of behavior
- Couple tests to internal structure
- Use random/non-deterministic test data
- Share state between tests

### Do NOT Cheat

- Hard-coding expected results to pass tests
- Writing `if` statements matching test inputs
- Returning specific values for test cases
- Example of cheating:
  ```typescript
  // BAD: Hard-coded for specific test
  function calculate(a: number, b: number): number {
    if (a === 215 && b === 300) return 85;
    if (a === 486 && b === 600) return 114;
    return 0;
  }
  ```

## Mocking Strategy

### When to Mock

- External dependencies (APIs, databases, file system)
- Time-dependent operations (Date.now(), timers)
- Random operations (Math.random())
- Complex dependencies not under test
- Async operations (Promises, Observables)

### Mock Requirements

- Mock external service calls
- Mock database queries
- Mock file I/O operations
- Use spy functions to verify interactions
- Return predictable, synchronous data when possible

### Mock Example

```typescript
// Mock Observable service method
jest.spyOn(service, 'get').mockReturnValue(
  of({
    id: 1,
    data: 'test',
    toJson: () => ({ id: 1, data: 'test' }),
  }),
);
```

## Handling Async Operations

### Observable/Promise Patterns

- Use `firstValueFrom()` in implementation
- Mock Observables with `of()` or `throwError()`
- Properly handle async/await in tests
- Ensure all Observables complete in tests

### Timeout Prevention

- Mock all external async operations
- Avoid real HTTP calls in unit tests
- Mock timers with `jest.useFakeTimers()`
- Set reasonable test timeouts

## Test Organization

### File Structure

- `*.spec.ts` for unit tests (same directory as source)
- `*.test.ts` for integration tests
- `*.e2e.ts` for end-to-end tests
- One test file per source file

### Test Grouping

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should handle valid input', () => {});
    it('should throw on invalid input', () => {});
    it('should return empty for edge case', () => {});
  });
});
```

## Regression Prevention

- All tests must pass before commit
- New features require new tests
- Bug fixes require reproduction test
- Refactoring must not break existing tests
- Use CI to enforce test pass

## Documentation Through Tests

- Tests serve as executable documentation
- Test names explain functionality
- Use JSDoc comments for complex logic
- Include usage examples in test descriptions

## Performance Considerations

- Unit tests should run fast (< 1s per test)
- Mock slow operations
- Use test parallelization
- Avoid real database/network in unit tests
- Integration tests can be slower

## Implementation Workflow

1. Write test describing one behavior
2. Run test → verify it fails
3. Write minimum code to pass test
4. Run test → verify it passes
5. Refactor if needed
6. Run all tests → verify no regression
7. Repeat for next behavior

## Red-Green-Refactor Cycle

**RED Phase:**

- Write test for non-existent functionality
- Test must fail with meaningful error
- Verify test failure reason is correct

**GREEN Phase:**

- Write simplest code to make test pass
- Don't worry about code quality yet
- Focus only on making test green

**REFACTOR Phase:**

- Improve code structure
- Remove duplication
- Optimize performance if needed
- All tests must remain green

## Practical Example: Vending Machine Change

**Requirement:** Calculate coin change for vending machine

**Test 1 - Empty Case:**

```typescript
test('getChange(1,1) returns empty array', () => {
  expect(getChange(1, 1)).toEqual([]);
});
```

**Implementation 1:**

```typescript
function getChange(payable: number, paid: number): number[] {
  return [];
}
```

**Test 2 - Basic Change:**

```typescript
test('getChange(215, 300) returns [50,20,10,5]', () => {
  expect(getChange(215, 300)).toEqual([50, 20, 10, 5]);
});
```

**Implementation 2:**

```typescript
function getChange(payable: number, paid: number): number[] {
  const coins = [200, 100, 50, 20, 10, 5, 2, 1];
  const change: number[] = [];
  let remaining = paid - payable;

  for (const coin of coins) {
    while (remaining >= coin) {
      change.push(coin);
      remaining -= coin;
    }
  }

  return change;
}
```

## Summary Checklist

Before writing any production code:

- [ ] Write failing test
- [ ] Verify test fails with expected reason
- [ ] Write minimal implementation
- [ ] Verify test passes
- [ ] Verify no test regressions
- [ ] Refactor if needed
- [ ] All tests still pass

## Reference Sources

Based on: https://github.com/dwyl/learn-tdd
Key principles: Red-Green-Refactor, Test-First, Minimal Implementation
