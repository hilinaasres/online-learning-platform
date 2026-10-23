export function notFound(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.code === 11000) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }
  const status = err.status || 500;
  const message = status < 500 ? err.message : "Server error";
  res.status(status).json({ message });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
