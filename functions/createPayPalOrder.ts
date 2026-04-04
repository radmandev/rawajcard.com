Deno.serve(async (req) => {
  return Response.json(
    { error: 'PayPal is temporarily disabled.' },
    { status: 503 },
  );
});