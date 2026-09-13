import os
import subprocess
import sys

def main():
    print("Ugg ugg! Caveman start local environment for boss!")
    
    # Find frontend folder
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frontend_dir = os.path.join(base_dir, 'frontend')
    
    print(f"Caveman go to {frontend_dir}")
    
    print("Caveman install magic npm tools... wait please.")
    subprocess.run(["npm", "install"], cwd=frontend_dir, shell=True)
    
    print("\nCaveman start game server!")
    print(">>> Open browser and go to: http://localhost:5173 <<<")
    print("Press CTRL+C to tell Caveman to stop.\n")
    
    try:
        subprocess.run(["npm", "run", "dev"], cwd=frontend_dir, shell=True)
    except KeyboardInterrupt:
        print("\nCaveman stop server. Goodbye!")

if __name__ == "__main__":
    main()
