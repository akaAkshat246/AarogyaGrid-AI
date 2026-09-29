export const store = req => req.app.locals.store;
export const ok = (res, data, status = 200) => res.status(status).json({
  success: true, ...(status === 201 && data?.id ? { id: data.id } : {}), data
});
export const requirePHC = (req, id) => store(req).get('phcs', id);
