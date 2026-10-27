
export function createFlashSale({
  endTime,
  now = () => Date.now()
}) {
  if (!Number.isFinite(endTime)) {
    throw new TypeError('Invalid sale end time.');
  }

  if (typeof now !== 'function') {
    throw new TypeError('Invalid clock function.');
  }

  function isActive() {
    return now() < endTime;
  }

  function canReserve() {
    return isActive();
  }

  function getStatus() {
    return isActive() ? 'ACTIVE' : 'ENDED';
  }

  return {
    isActive,
    canReserve,
    getStatus
  };
}
