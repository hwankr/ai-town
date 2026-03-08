export function createWorldPointerController() {
  return {
    onPointerDown() {
      return 'pointer-handling-pending';
    }
  };
}
