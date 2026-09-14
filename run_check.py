import subprocess

def run_proc(cmd, cwd, log_file):
    try:
        result = subprocess.run(cmd, cwd=cwd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write(f"EXIT CODE: {result.returncode}\n")
            f.write(result.stdout)
    except Exception as e:
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write(str(e))

run_proc('npx tsc --noEmit', 'e:/projects_placements/WorkMitra/backend', 'e:/projects_placements/WorkMitra/backend/ts_error_clean.log')
run_proc('npx vite build', 'e:/projects_placements/WorkMitra/frontend', 'e:/projects_placements/WorkMitra/frontend/vite_error_clean.log')
