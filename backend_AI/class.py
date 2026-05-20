# simpan sebagai cek_kelas.py lalu jalankan: python cek_kelas.py
import os
from collections import Counter

dataset_path = r"D:\jalankita\dataset_merged"
class_names = ["lubang_besar", "lubang_kecil", "retak_kulit_buaya", "retak_memanjang"]

for split in ["train", "valid", "test"]:
    label_dir = f"{dataset_path}\\{split}\\labels"
    counter = Counter()
    for fname in os.listdir(label_dir):
        if fname.endswith(".txt"):
            with open(f"{label_dir}\\{fname}") as f:
                for line in f:
                    parts = line.strip().split()
                    if parts:
                        counter[int(parts[0])] += 1
    print(f"\n[{split}]")
    for cid, name in enumerate(class_names):
        print(f"  {name:25s}: {counter.get(cid, 0)} objek")