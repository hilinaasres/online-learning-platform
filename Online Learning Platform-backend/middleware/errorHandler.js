export function notFound(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
