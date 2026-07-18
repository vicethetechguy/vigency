export type SpydaCoupon = {
  id: string;
  code: string;
  credit_amount: number;
  status: string;
  created_at: string;
};

export async function generateSpydaCoupon(creditAmount: 500 | 1000 | 2800): Promise<SpydaCoupon> {
  const supabaseUrl = process.env.SPYDA_SUPABASE_URL;
  const serviceKey = process.env.SPYDA_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Spyda Supabase credentials missing');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/generate_coupon`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_credit_amount: creditAmount }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Spyda Supabase error: ${response.status} ${errorText}`);
    throw new Error(`Spyda Supabase error: ${response.status}`);
  }

  return response.json();
}
