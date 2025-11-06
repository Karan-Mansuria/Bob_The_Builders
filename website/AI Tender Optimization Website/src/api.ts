export type JobCreateResponse = { job_id: string; status: string };
export type JobStatusResponse = {
  id: string;
  status: string;
  error_message?: string | null;
  filename?: string | null;
  created_at?: string | null;
  result?: {
    base_price?: number;
    best_bid?: number;
    p_win_at_best?: number;
    expected_profit_at_best?: number;
    profit_if_won_at_best?: number;
    initial_bracket?: number[];
    auto_expanded?: boolean;
    diagnostic_bids?: number[];
    diagnostic_exp_profit?: number[];
    extracted_data?: {
      "Tender No"?: string;
      "Estimated Cost"?: string;
      "EMD"?: string;
      "Date of Opening"?: string;
      "Completion Time"?: string;
    };
  };
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function createJob(file: File, qualityScore: number, minBid?: number, maxBid?: number): Promise<JobCreateResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("quality_score", String(qualityScore));
  if (minBid != null) form.append("min_bid", String(minBid));
  if (maxBid != null) form.append("max_bid", String(maxBid));

  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Failed to create job: ${res.status}`);
  return res.json();
}

export async function getJob(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  if (!res.ok) throw new Error(`Failed to fetch job: ${res.status}`);
  return res.json();
}

export async function getJobs(): Promise<JobStatusResponse[]> {
  const res = await fetch(`${API_BASE}/api/jobs`);
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  return res.json();
}


