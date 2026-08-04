import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RAW = [
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1042683/medium/Usado-Notebook-Dell-Latitude-E5470-i5-6-Gera-o-8GB-SSD-128GB-Tela-14_1779800621.png", "Usado - Notebook Dell Latitude E5470 | i5 6ª Geração | 8GB | SSD 128GB | Tela 14", "1.840,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040373/medium/Usado-Notebook-Dell-Latitude-3410-Intel-Core-i5-8GB-256gb-Tela-Full-Hd-Win-11-Pro_1779281317.png", "Usado - Notebook Dell Latitude 3410 Intel Core i5 8GB 256gb Tela Full Hd Win 11 Pro", "3.190,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1042690/medium/Usado-Notebook-Hp-240-G7-i3-7-Gera-o-8GB-SSD-256gb-Tela-14_1779800621.png", "Usado - Notebook Hp 240 G7 | i3 7ª Geração | 8GB | SSD 256gb | Tela 14", "1.790,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1054490/medium/Usado-Lenovo-Thinkpad-E14-i5-11-Gera-o-8GB-SSD-Nvme-256gb-Tela-14-Full-Hd_1783020233.png", "Usado - Lenovo Thinkpad E14 | i5 11ª Geração | 8GB | SSD Nvme 256gb | Tela 14\" Full Hd", "2.690,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1042693/medium/Usado-Notebook-Samsung-350x-i3-7-Gera-o-8GB-SSD-256gb-Tela-15-6_1779800622.png", "Usado - Notebook Samsung 350x | i3 7ª Geração | 8GB | SSD 256gb | Tela 15.6", "1.840,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1002515/medium/Usado-Notebook-Dell-Latitude-5410-Intel-Core-i5-10-SSD-256gb-16gb-Mem-WINDOWS-11-Pro-WINDOWS-Hello-Ia-Copilot_1774632526.png", "Usado - Notebook Dell Latitude 5410 Intel Core i5 10ª SSD 256gb 16gb Mem WINDOWS 11 Pro WINDOWS Hello Ia Copilot", "2.719,50"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/988959/medium/Usado-Notebook-Usado-Hp-845-G8-Ryzen-3-5450u-Pro-SSD-256gb-8GB-Video-Vega-6-Biometria-WINDOWS-11-Pro_1783965272.webp", "Usado - Notebook Usado Hp 845 G8 Ryzen 3 5450u Pro SSD 256gb 8GB Video Vega 6 Biometria WINDOWS 11 Pro", "3.034,50"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/895426/medium/Notebook-Lenovo-Ideapad-Slim-3-15irh10-Intel-Core-i5-13420h-8GB-512gb-SSD-Linux-15-3-83nss00000-Luna-Grey_1784923148.jpg", "Notebook Lenovo Ideapad Slim 3 15irh10 Intel Core i5-13420h 8GB 512gb SSD Linux 15.3\" - 83nss00000 Luna Grey", "3.413,34"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1042680/medium/Usado-Notebook-Dell-Vostro-3481-i3-7-Gera-o-8GB-SSD-256gb-Tela-14_1779800620.png", "Usado - Notebook Dell Vostro 3481 | i3 7ª Geração | 8GB | SSD 256gb | Tela 14", "1.840,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1053019/medium/Usado-Notebook-Dell-Vostro-3401-Core-i5-1035g1-8GB-256gb-SSD-Win-10-Pro_1782418120.png", "Usado - Notebook Dell Vostro 3401 Core i5-1035g1 8GB 256gb SSD Win 10 Pro", "2.719,50"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1039191/medium/Usado-Hp-Elitebook-840-G8-14-i5-16gb-SSD-256gb-Prateado_1779132232.png", "Usado - Hp Elitebook 840 G8 14\" i5 16gb SSD 256gb Prateado", "3.139,50"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1033462/medium/Usado-Notebook-Hp-Elitebook-840-G8-Core-i5-1135g7-8GB-SSD-256gb_1779127723.png", "Usado - Notebook Hp Elitebook 840 G8 Core i5-1135g7 8GB SSD 256gb", "3.590,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1007344/medium/Usado-Notebook-2-Em-1-Robusto-militar-Getac-V110-G4-Core-i5-2-5ghz-16gb-SSD-256gb-Win-11-Pro_1783965267.jpg", "Usado - Notebook 2 Em 1 Robusto (militar) Getac V110 G4, Core i5 2.5ghz, 16gb, SSD-256gb, Win 11 Pro", "4.990,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/884674/medium/Usado-Notebook-Dell-Vostro-3400-Core-i5-11-gen-SSD-240GB-8GB-Win-11-Pro-Voke_1783965262.jpg", "Usado: Notebook Dell Vostro 3400 Core i5 11°gen SSD 240GB 8GB Win 11 Pro - Voke", "2.599,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040751/medium/Usado-Apple-Macbook-Pro-2019-16-Intel-Core-i7-512gb-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro 2019 16\" Intel Core i7 512gb SSD 16gb Ram Cinza Espacial Bom - Trocafone", "3.939,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/894571/medium/Usado-Notebook-Dell-Latitude-3420-Core-i5-11-gen-SSD-256gb-8GB-Win-11-Pro-Voke_1784825654.jpg", "Usado: Notebook Dell Latitude 3420 Core i5 11ªgen SSD 256gb 8GB Win 11 Pro - Voke", "2.399,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/993432/medium/Usado-Notebook-Dell-Precision-7520-Core-i7-SSD-512gb-16gb-Video-Dedocado-Nvidia-M2000m-4gb_1773940428.jpg", "Usado - Notebook Dell Precision 7520 Core i7 SSD 512gb 16gb Video Dedocado Nvidia M2000m 4gb", "3.769,50"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/945385/medium/USADO-Notebook-Dell-Vostro-5402-Tela-14-Core-i7-11-gera-o-16gb-SSD-512gb-Nvidia-2gb-OTH-PRODUTOS_1783965260.jpg", "USADO: Notebook Dell, Vostro 5402, Tela 14\", Core i7 11ºgeração, 16gb, SSD-512gb + Nvidia 2gb - OTH PRODUTOS", "3.771,00"],
  ["https://images.kabum.com.br/produtos/fotos/895878/notebook-gamer-asus-rog-strix-g16-intel-core-i9-14900hx-rtx5060-16gb-512-ssd-w11-home-16-fhd-240hz-cinza-eclipse-g615jmr-s5001w_1763382270_m.jpg", "Notebook Gamer ASUS ROG Strix G16, Intel Core i9 14900HX, RTX5060, 16GB, 512 SSD, W11 Home, 16\" FHD 240Hz, Cinza Eclipse - G615JMR-S5001W", "12.999,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1054488/medium/Usado-Notebook-Lenovo-Thinkbook-14-G6-Irl-Intel-Core-i5-13-8GB-SSD-Nvme-256gb-Tela-14-Wuxga_1783020233.png", "Usado - Notebook Lenovo Thinkbook 14 G6 Irl | Intel Core i5 13ª | 8GB | SSD Nvme 256gb | Tela 14\" Wuxga", "4.190,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1049748/medium/Usado-Notebook-Hp-240-G7-i3-10-Gera-o-8GB-SSD-256gb-Tela-14_1781620121.png", "Usado - Notebook Hp 240 G7 | i3 10ª Geração | 8GB | SSD 256gb | Tela 14", "2.040,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/952259/medium/USADO-Notebook-Robusto-Dell-2-Em-1-Latitude-Extreme-7424-Tela-14-Core-i5-32gb-SSD-1TB-OTH-PRODUTOS_1783965260.jpg", "USADO - Notebook Robusto Dell 2 Em 1, Latitude Extreme 7424, Tela 14\", Core i5, 32gb, SSD-1TB - OTH PRODUTOS", "12.990,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040755/medium/Usado-Apple-Macbook-Pro-M2-2022-13-10core-256gb-SSD-8GB-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro M2 2022 13\" 10core 256gb SSD 8GB Ram Cinza Espacial Bom - Trocafone", "4.899,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1020413/medium/Usado-Lenovo-Thinkpad-P15-Intel-Core-i7-16gb-Ram-SSD-512gb-Tela-Fhd-15-6-WINDOWS-11-Preto_1774625625.png", "Usado Lenovo Thinkpad P15 Intel Core i7 16gb Ram SSD 512gb Tela Fhd 15.6\" WINDOWS 11 Preto", "5.990,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1034773/medium/Usado-Apple-Macbook-Pro-M2-2022-13-10core-256gb-SSD-8GB-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1783965284.jpg", "Usado - Apple Macbook Pro M2 2022 13\" 10core 256gb SSD 8GB Ram Cinza Espacial Muito Bom - Trocafone", "5.209,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040019/medium/Usado-Notebook-Hp-Zbook-Fury-G7-15-i7-10850h-16gb-512gb-Cinza_1779212621.png", "Usado - Notebook Hp Zbook Fury G7 15\" i7-10850h 16gb 512gb Cinza", "6.985,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/902704/medium/Notebook-Lenovo-Ideapad-1-15amn7-AMD-Ryzen-5-7520u-8GB-512GB-SSD-15-6-WINDOWS-11-82x5000nbr-Cloud-Grey_1784923133.jpg", "Notebook Lenovo Ideapad 1 15amn7, AMD Ryzen 5 7520u, 8GB, 512GB SSD, 15.6\", WINDOWS 11 - 82x5000nbr Cloud Grey", "4.998,48"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040750/medium/Usado-Apple-Macbook-Pro-M1-2021-14-10core-1TB-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro M1 2021 14\" 10core 1TB SSD 16gb Ram Cinza Espacial Bom - Trocafone", "6.959,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040747/medium/Usado-Apple-Macbook-Pro-2019-16-Intel-Core-i7-512gb-SSD-16gb-Ram-Cinza-Espacial-Excelente-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro 2019 16\" Intel Core i7 512gb SSD 16gb Ram Cinza Espacial Excelente - Trocafone", "5.079,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040746/medium/Usado-Apple-Macbook-Pro-2019-16-Intel-Core-i9-1TB-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro 2019 16\" Intel Core i9 1TB SSD 16gb Ram Cinza Espacial Bom - Trocafone", "4.579,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1034772/medium/Usado-Apple-Macbook-Pro-M1-2021-16-10core-512gb-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1783965283.jpg", "Usado - Apple Macbook Pro M1 2021 16\" 10core 512gb SSD 16gb Ram Cinza Espacial Bom - Trocafone", "7.829,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/833957/medium/Notebook-Asus-Vivobook-15-M1502ya-Amd-Ryzen-7-5825u-8GB-Ram-512gb-SSD-Linux-Keepos-15-6-Fhd-Cool-Silver-Nj611_1785341312.jpg", "Notebook Asus Vivobook 15 M1502ya Amd Ryzen 7 5825u 8GB Ram 512gb SSD Linux Keepos 15,6\" Fhd Cool Silver - Nj611", "3.484,15"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040754/medium/Usado-Apple-Macbook-Pro-M1-2020-13-8core-256gb-SSD-8GB-Ram-Space-Gray-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro M1 2020 13\" 8core 256gb SSD 8GB Ram Space Gray Bom - Trocafone", "4.529,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040743/medium/Usado-Apple-Macbook-Pro-2019-16-Intel-Core-i7-512gb-SSD-16gb-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1779381524.jpg", "Usado - Apple Macbook Pro 2019 16\" Intel Core i7 512gb SSD 16gb Ram Cinza Espacial Muito Bom - Trocafone", "4.199,00"],
  ["https://images.kabum.com.br/produtos/fotos/magalu/959235/medium/Notebook-Lenovo-Ideapad-310-Intel-Core-i5_1763582563.jpg", "Notebook Lenovo Ideapad 310 Intel Core i5", "2.599,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/482556/medium/Notebook-Conc-rdia-C5215-Intel-Core-I7-1255u-32GB-RAM-SSD-1TB-Tela-15-6-Full-HD-FreeDos_1783605864.jpg", "Notebook Concórdia C5215, Intel Core I7-1255u, 32GB RAM, SSD 1TB, Tela 15.6\" Full HD, FreeDos", "6.455,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/995747/medium/Usado-Apple-Macbook-Pro-M1-2021-16-10core-512gb-SSD-16gb-Ram-Cinza-Espacial-Excelente_1783965284.jpg", "Usado - Apple Macbook Pro M1 2021 16\" 10core 512gb SSD 16gb Ram Cinza Espacial - Excelente", "8.649,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/170826/Notebook-Compaq-Presario-Cq-29-Intel-I5-5257u-8GB-RAM-DDR3-SSD-480GB-Tela-15-6-Full-HD-Windows-10-Home-Preto_1719513571_m.jpg", "Notebook Compaq Presario Cq-29 Intel I5 5257u, 8GB RAM DDR3, SSD 480GB, Tela 15.6 Full HD, Windows 10 Home, Preto", "3.005,99"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1018331/medium/USADO-Apple-MacBook-Pro-A2141-Intel-Core-i7-2019-SSD-500GB-16GB-Radeon-5300M-16-Prateado_1773940133.png", "USADO - Apple MacBook Pro A2141 Intel Core i7 2019 SSD 500GB 16GB Radeon 5300M 16\" Prateado", "4.504,50"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1034770/medium/Usado-Apple-Macbook-Pro-M1-2021-14-8core-512gb-SSD-16gb-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1783965283.jpg", "Usado - Apple Macbook Pro M1 2021 14\" 8core 512gb SSD 16gb Ram Cinza Espacial Muito Bom - Trocafone", "7.809,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/945383/medium/USADO-Macbook-Pro-Mvvl2ll-a-Tela-16-Core-i7-2-6ghz-16gb-SSD-512gb-4gb-Dedicada-Touchbar-Prateado-OTH-PRODUTOS_1783965285.jpg", "USADO: Macbook Pro, Mvvl2ll/a, Tela 16\", Core i7 2.6ghz, 16gb, SSD 512gb, 4gb Dedicada, Touchbar - Prateado - OTH PRODUTOS", "5.490,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040756/medium/Usado-Apple-Macbook-Pro-M1-2021-14-8core-512gb-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro M1 2021 14\" 8core 512gb SSD 16gb Ram Cinza Espacial Bom - Trocafone", "7.329,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040749/medium/Usado-Apple-Macbook-Pro-M1-Max-2021-16-10core-1TB-SSD-32gb-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro M1 Max 2021 16\" 10core 1TB SSD 32gb Ram Cinza Espacial Muito Bom - Trocafone", "10.999,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1020156/medium/Usado-Apple-Macbook-Air-A2337-2020-M1-SSD-256gb-8GB-13-3-Retina-Touch-Id-Space-Gray_1773939521.png", "Usado - Apple Macbook Air A2337 2020 M1 SSD 256gb 8GB 13.3\" Retina Touch Id Space Gray", "5.029,50"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/871869/medium/Recondicionado-Notebook-Gamer-Acer-Helios-Neo-PHN16-71-72W6-i7-RTX-4060-16GB-512GB-16-165Hz_1770930830.jpg", "Recondicionado - Notebook Gamer Acer Helios Neo PHN16-71-72W6 i7 RTX 4060 16GB 512GB 16\" 165Hz", "8.420,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/945386/medium/USADO-Macbook-Air-Mlxx3bz-a-2022-Chip-M2-Tela-13-6-8GB-SSD-512gb-Cinza-Espacial-OTH-PRODUTOS_1783965285.jpg", "USADO: Macbook Air Mlxx3bz/a (2022) Chip M2, Tela 13.6\", 8GB, SSD-512gb - Cinza Espacial - OTH PRODUTOS", "6.741,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/945376/medium/USADO-Macbook-Pro-Mvvl2ll-a-Tela-16-Core-i7-2-6ghz-16gb-SSD-512gb-4gb-Dedicada-Touchbar-Cinza-Espacial-OTH-PRODUTOS_1783965283.jpg", "USADO: Macbook Pro, Mvvl2ll/a, Tela 16\", Core i7 2.6ghz, 16gb, SSD-512gb, 4gb Dedicada, Touchbar - Cinza Espacial - OTH PRODUTOS", "4.990,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1035035/medium/Usado-Apple-Macbook-Pro-M1-2021-16-10core-512GB-SSD-16GB-RAM-Cinza-Espacial-Muito-Bom_1783965283.jpg", "Usado - Apple Macbook Pro M1 2021 16\" 10core, 512GB SSD, 16GB RAM, Cinza Espacial - Muito Bom", "8.239,00"],
  ["https://images.kabum.com.br/produtos/fotos/magalu/959099/medium/Notebook-Dell-Inspiron-i15-5566-D10P-Intel-Core-i3_1763582547.jpg", "Notebook Dell Inspiron i15-5566-D10P Intel Core i3", "2.399,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040753/medium/Usado-Apple-Macbook-Pro-M1-2020-13-8core-256gb-SSD-8GB-Ram-Space-Gray-Muito-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro M1 2020 13\" 8core 256gb SSD 8GB Ram Space Gray Muito Bom - Trocafone", "4.819,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040752/medium/Usado-Apple-Macbook-Pro-M1-Max-2021-16-10core-1TB-SSD-32gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro M1 Max 2021 16\" 10core 1TB SSD 32gb Ram Cinza Espacial Bom - Trocafone", "10.339,00"],
  ["https://images.kabum.com.br/produtos/fotos/magalu/959535/medium/Notebook-Positivo-Unique-S2500-Intel-Celeron_1763582594.jpg", "Notebook Positivo Unique S2500 Intel Celeron", "1.099,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040742/medium/Usado-Apple-Macbook-Pro-M1-2020-13-8core-512gb-SSD-8GB-Ram-Space-Gray-Excelente-Trocafone_1779381524.jpg", "Usado - Apple Macbook Pro M1 2020 13\" 8core 512gb SSD 8GB Ram Space Gray Excelente - Trocafone", "8.219,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040741/medium/Usado-Apple-Macbook-Pro-M1-2020-13-8core-512gb-SSD-8GB-Ram-Space-Gray-Muito-Bom-Trocafone_1779381524.jpg", "Usado - Apple Macbook Pro M1 2020 13\" 8core 512gb SSD 8GB Ram Space Gray Muito Bom - Trocafone", "5.209,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/776333/medium/Usado-Apple-Macbook-Pro-A2141-Core-i7-9-gen-SSD-512gb-16gb-Cinza-Espacial_1783965266.jpg", "Usado - Apple Macbook Pro A2141 Core i7 9ªgen SSD 512gb 16gb - Cinza Espacial", "5.099,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1034774/medium/Usado-Apple-Macbook-Pro-M1-2021-14-8core-512gb-SSD-16gb-Ram-Cinza-Espacial-Excelente-Trocafone_1783965284.jpg", "Usado - Apple Macbook Pro M1 2021 14\" 8core 512gb SSD 16gb Ram Cinza Espacial Excelente - Trocafone", "8.219,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040744/medium/Usado-Apple-Macbook-Pro-M1-2021-14-10core-1TB-SSD-16gb-Ram-Cinza-Espacial-Excelente-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro M1 2021 14\" 10core 1TB SSD 16gb Ram Cinza Espacial Excelente - Trocafone", "7.999,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/989016/medium/Usado-Macbook-Pro-Intel-Core-i7-SSD-500gb-16gb-Ddr4-Tela-16-V-deo-Dedicado-Amd-5300m-Touch-Id-Touch-Bar_1783965284.jpg", "Usado - Macbook Pro Intel Core i7 SSD 500gb 16gb Ddr4 Tela 16\" Vídeo Dedicado Amd 5300m Touch Id Touch Bar", "4.790,00"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1020154/medium/Recondicionado-Macbook-Pro-A2251-Core-i5-SSD-500gb-16gb-Ddr4-Tela-13-3-V-deo-Intel-Touch-Id-Touch-Bar_1783965285.png", "Recondicionado - Macbook Pro A2251 Core i5 SSD 500gb 16gb Ddr4 Tela 13.3\" Vídeo Intel Touch Id Touch Bar", "4.084,50"],
  ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/1040748/medium/Usado-Apple-Macbook-Pro-M1-2021-14-10core-1TB-SSD-16gb-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1779381525.jpg", "Usado - Apple Macbook Pro M1 2021 14\" 10core 1TB SSD 16gb Ram Cinza Espacial Muito Bom - Trocafone", "7.399,00"]
];

const BRANDS = [
  { match: /apple|macbook/i, name: "Apple" },
  { match: /dell/i, name: "Dell" },
  { match: /hp|compaq/i, name: "HP" },
  { match: /lenovo|thinkpad|thinkbook|ideapad/i, name: "Lenovo" },
];

function brandOf(name) {
  for (const b of BRANDS) if (b.match.test(name)) return b.name;
  return "Outras Marcas";
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function extractSpecs(name) {
  const specs = {};
  const storage = name.match(/SSD[\s-]*(\d+\s*[a-z]+(?:b|tb)?)/i) || name.match(/SSD\s*(\d+)/i);
  if (storage) specs["Armazenamento"] = `SSD ${storage[1]}`.toUpperCase();
  const ram = name.match(/(\d+)\s*(?:GB|gb)\s*(?:Ram|RAM|Mem|DDR\d?|Ddr4|De mem)/) || name.match(/(\d+)\s*GB\s+RAM/i);
  if (ram) specs["Memória"] = `${ram[1]}GB`;
  const tela = name.match(/Tela\s*([\d,."]+)/i);
  if (tela) specs["Tela"] = `${tela[1].replace(/"/g, "")}"`;
  const gpu = name.match(/RTX\s*\d+[^,|/]*|GTX\s*\d+[^,|/]*|Vega\s*\d+[^,|/]*|Radeon\s*[^,|/]*|Nvidia\s*[^,|/]*/i);
  if (gpu) specs["Placa de Vídeo"] = gpu[0].trim().replace(/[|]/g, "").trim();
  return specs;
}

function makeDescription(name, brand) {
  const used = /usado|recondicionado/i.test(name);
  return used
    ? "Equipamento seminovo revisado e testado por nossa equipe, pronto para uso. Procedência verificada, garantia inclusa e suporte técnico em Campinas."
    : "Notebook novo com procedência garantida. Consulte disponibilidade, retirada e entrega direto com nossa equipe em Campinas.";
}

const usedSlugs = new Map();
const products = RAW.map(([image, rawName, price]) => {
  const name = rawName.replace(/\s+/g, " ").trim();
  const category = brandOf(name);
  let slug = slugify(name);
  const count = usedSlugs.get(slug) ?? 0;
  usedSlugs.set(slug, count + 1);
  if (count > 0) slug = `${slug}-${count + 1}`;

  const isUsed = /usado|recondicionado/i.test(name);
  const badge = /recondicionado/i.test(name)
    ? "Recondicionado"
    : isUsed
      ? "Seminovo"
      : undefined;

  return {
    id: slug,
    name,
    price: `R$ ${price}`,
    image,
    category,
    slug,
    badge,
    description: makeDescription(name, category),
    specs: extractSpecs(name),
  };
});

const outPath = join(__dirname, "..", "data", "products.json");
writeFileSync(outPath, JSON.stringify(products, null, 2) + "\n", "utf8");
console.log(`Gerados ${products.length} produtos em ${outPath}`);
const byBrand = products.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});
console.log("Por marca:", JSON.stringify(byBrand, null, 2));
const dupes = products.filter((p) => products.filter((x) => x.id === p.id).length > 1);
if (dupes.length) console.log("ATENÇÃO: ids duplicados!", dupes.length);
