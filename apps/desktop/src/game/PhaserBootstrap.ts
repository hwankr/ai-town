export function bootstrapPhaser(container: HTMLDivElement): () => void {
  container.dataset.engine = 'phaser-bootstrap-pending';
  return () => {
    delete container.dataset.engine;
  };
}
