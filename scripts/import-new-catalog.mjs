import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "data", "products.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

// TSV: URL do produto <TAB> URL da imagem <TAB> Nome <TAB> Preço
const RAW = `
https://www.kabum.com.br/produto/1042683/usado-notebook-dell-latitude-e5470-i5-6-geracao-8gb-ssd-128gb-tela-14\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1042683/medium/Usado-Notebook-Dell-Latitude-E5470-i5-6-Gera-o-8GB-SSD-128GB-Tela-14_1779800621.png\tUsado -  Notebook Dell Latitude E5470 | i5 6ª Geração | 8GB | SSD 128GB | Tela 14\t1.840,00
https://www.kabum.com.br/produto/1040373/usado-notebook-dell-latitude-3410-intel-core-i5-8gb-256gb-tela-full-hd-win-11-pro\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040373/medium/Usado-Notebook-Dell-Latitude-3410-Intel-Core-i5-8GB-256gb-Tela-Full-Hd-Win-11-Pro_1779281317.png\tUsado - Notebook Dell Latitude 3410 Intel Core i5 8GB 256gb Tela Full Hd Win 11 Pro\t3.190,00
https://www.kabum.com.br/produto/1042690/usado-notebook-hp-240-g7-i3-7-geracao-8gb-ssd-256gb-tela-14\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1042690/medium/Usado-Notebook-Hp-240-G7-i3-7-Gera-o-8GB-SSD-256gb-Tela-14_1779800621.png\tUsado - Notebook Hp 240 G7 | i3 7ª Geração | 8GB | SSD 256gb | Tela 14\t1.790,00
https://www.kabum.com.br/produto/1054490/usado-lenovo-thinkpad-e14-i5-11-geracao-8gb-ssd-nvme-256gb-tela-14-full-hd\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1054490/medium/Usado-Lenovo-Thinkpad-E14-i5-11-Gera-o-8GB-SSD-Nvme-256gb-Tela-14-Full-Hd_1783020233.png\tUsado - Lenovo Thinkpad E14 | i5 11ª Geração | 8GB | SSD Nvme 256gb | Tela 14" Full Hd\t2.690,00
https://www.kabum.com.br/produto/1042693/usado-notebook-samsung-350x-i3-7-geracao-8gb-ssd-256gb-tela-15-6\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1042693/medium/Usado-Notebook-Samsung-350x-i3-7-Gera-o-8GB-SSD-256gb-Tela-15-6_1779800622.png\tUsado - Notebook Samsung 350x | i3 7ª Geração | 8GB | SSD 256gb | Tela 15.6\t1.840,00
https://www.kabum.com.br/produto/1002515/notebook-dell-latitude-5410-intel-core-i5-10-ssd-256gb-16gb-mem-windows-11-pro-windows-hello-ia-copilot\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1002515/medium/Usado-Notebook-Dell-Latitude-5410-Intel-Core-i5-10-SSD-256gb-16gb-Mem-WINDOWS-11-Pro-WINDOWS-Hello-Ia-Copilot_1774632526.png\tUsado - Notebook Dell Latitude 5410 Intel Core i5 10ª SSD 256gb 16gb Mem WINDOWS 11 Pro   WINDOWS Hello Ia Copilot\t2.719,50
https://www.kabum.com.br/produto/988959/usado-notebook-usado-hp-845-g8-ryzen-3-5450u-pro-ssd-256gb-8gb-video-vega-6-biometria-windows-11-pro\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/988959/medium/Usado-Notebook-Usado-Hp-845-G8-Ryzen-3-5450u-Pro-SSD-256gb-8GB-Video-Vega-6-Biometria-WINDOWS-11-Pro_1783965272.webp\tUsado - Notebook Usado Hp 845 G8 Ryzen 3 5450u Pro SSD 256gb 8GB Video Vega 6 Biometria WINDOWS 11 Pro\t3.034,50
https://www.kabum.com.br/produto/895426/notebook-lenovo-ideapad-slim-3-15irh10-intel-core-i5-13420h-8gb-512gb-ssd-linux-15-3-83nss00000-luna-grey\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/895426/medium/Notebook-Lenovo-Ideapad-Slim-3-15irh10-Intel-Core-i5-13420h-8GB-512gb-SSD-Linux-15-3-83nss00000-Luna-Grey_1784923148.jpg\tNotebook Lenovo Ideapad Slim 3 15irh10 Intel Core i5-13420h 8GB 512gb SSD Linux 15.3" - 83nss00000 Luna Grey\t3.413,34
https://www.kabum.com.br/produto/1042680/usado-notebook-dell-vostro-3481-i3-7-geracao-8gb-ssd-256gb-tela-14\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1042680/medium/Usado-Notebook-Dell-Vostro-3481-i3-7-Gera-o-8GB-SSD-256gb-Tela-14_1779800620.png\tUsado -  Notebook Dell Vostro 3481 | i3 7ª Geração | 8GB | SSD 256gb | Tela 14\t1.840,00
https://www.kabum.com.br/produto/1053019/usado-notebook-dell-vostro-3401-core-i5-1035g1-8gb-256gb-ssd-win-10-pro\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1053019/medium/Usado-Notebook-Dell-Vostro-3401-Core-i5-1035g1-8GB-256gb-SSD-Win-10-Pro_1782418120.png\tUsado - Notebook Dell Vostro 3401 Core i5-1035g1 8GB 256gb SSD Win 10 Pro\t2.719,50
https://www.kabum.com.br/produto/1039191/usado-hp-elitebook-840-g8-14-i5-16gb-ssd-256gb-prateado\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1039191/medium/Usado-Hp-Elitebook-840-G8-14-i5-16gb-SSD-256gb-Prateado_1779132232.png\tUsado - Hp Elitebook 840 G8 14" i5 16gb SSD 256gb Prateado\t3.139,50
https://www.kabum.com.br/produto/1033462/usado-notebook-hp-elitebook-840-g8-core-i5-1135g7-16gb-ssd-256gb\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1033462/medium/Usado-Notebook-Hp-Elitebook-840-G8-Core-i5-1135g7-8GB-SSD-256gb_1779127723.png\tUsado - Notebook Hp Elitebook 840 G8 Core i5-1135g7 8GB SSD 256gb\t3.590,00
https://www.kabum.com.br/produto/1007344/usado-notebook-2-em-1-robusto-militar-getac-v110-g4-core-i5-2-5ghz-16gb-ssd-256gb-win-11-pro\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1007344/medium/Usado-Notebook-2-Em-1-Robusto-militar-Getac-V110-G4-Core-i5-2-5ghz-16gb-SSD-256gb-Win-11-Pro_1783965267.jpg\tUsado- Notebook 2 Em 1 Robusto (militar) Getac V110 G4, Core i5 2.5ghz, 16gb, SSD-256gb, Win 11 Pro\t4.990,00
https://www.kabum.com.br/produto/884674/usado-notebook-dell-vostro-3400-core-i5-11-gen-ssd-240gb-8gb-win-11-pro-voke\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/884674/medium/Usado-Notebook-Dell-Vostro-3400-Core-i5-11-gen-SSD-240GB-8GB-Win-11-Pro-Voke_1783965262.jpg\tUsado: Notebook Dell Vostro 3400 Core i5 11°gen SSD 240GB 8GB Win 11 Pro - Voke\t2.599,00
https://www.kabum.com.br/produto/1040751/usado-apple-macbook-pro-2019-16-intel-core-i7-512gb-ssd-16gb-ram-cinza-espacial-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040751/medium/Usado-Apple-Macbook-Pro-2019-16-Intel-Core-i7-512gb-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro 2019 16" Intel Core i7 512gb SSD 16gb Ram Cinza Espacial Bom - Trocafone\t3.939,00
https://www.kabum.com.br/produto/894571/usado-notebook-dell-latitude-3420-core-i5-11-gen-ssd-256gb-8gb-win-11-pro-voke\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/894571/medium/Usado-Notebook-Dell-Latitude-3420-Core-i5-11-gen-SSD-256gb-8GB-Win-11-Pro-Voke_1784825654.jpg\tUsado: Notebook Dell Latitude 3420 Core i5 11ªgen SSD 256gb 8GB Win 11 Pro - Voke\t2.399,00
https://www.kabum.com.br/produto/993432/notebook-dell-precision-7520-core-i7-ssd-512gb-16gb-video-dedocado-nvidia-m2000m-4gb\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/993432/medium/Usado-Notebook-Dell-Precision-7520-Core-i7-SSD-512gb-16gb-Video-Dedocado-Nvidia-M2000m-4gb_1773940428.jpg\tUsado - Notebook Dell Precision 7520 Core i7 SSD 512gb 16gb Video Dedocado Nvidia M2000m 4gb\t3.769,50
https://www.kabum.com.br/produto/945385/usado-notebook-dell-vostro-5402-tela-14-core-i7-11-geracao-16gb-ssd-512gb-nvidia-2gb-oth-produtos\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/945385/medium/USADO-Notebook-Dell-Vostro-5402-Tela-14-Core-i7-11-gera-o-16gb-SSD-512gb-Nvidia-2gb-OTH-PRODUTOS_1783965260.jpg\tUSADO: Notebook Dell, Vostro 5402, Tela 14", Core i7 11ºgeração, 16gb, SSD-512gb + Nvidia 2gb - OTH PRODUTOS\t3.771,00
https://www.kabum.com.br/produto/895878/notebook-gamer-asus-rog-strix-g16-intel-core-i9-14900hx-rtx5060-16gb-512-ssd-w11-home-16-fhd-240hz-cinza-eclipse-g615jmr-s5001w\thttps://images.kabum.com.br/produtos/fotos/895878/notebook-gamer-asus-rog-strix-g16-intel-core-i9-14900hx-rtx5060-16gb-512-ssd-w11-home-16-fhd-240hz-cinza-eclipse-g615jmr-s5001w_1763382270_m.jpg\tNotebook Gamer ASUS ROG Strix G16, Intel Core i9 14900HX, RTX5060, 16GB, 512 SSD, W11 Home, 16" FHD 240Hz, Cinza Eclipse - G615JMR-S5001W\t12.999,00
https://www.kabum.com.br/produto/1054488/usado-notebook-lenovo-thinkbook-14-g6-irl-intel-core-i5-13-8gb-ssd-nvme-256gb-tela-14-wuxga\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1054488/medium/Usado-Notebook-Lenovo-Thinkbook-14-G6-Irl-Intel-Core-i5-13-8GB-SSD-Nvme-256gb-Tela-14-Wuxga_1783020233.png\tUsado - Notebook Lenovo Thinkbook 14 G6 Irl | Intel Core i5 13ª | 8GB | SSD Nvme 256gb | Tela 14" Wuxga\t4.190,00
https://www.kabum.com.br/produto/1049748/usado-notebook-hp-240-g7-i3-10-geracao-8gb-ssd-256gb-tela-14\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1049748/medium/Usado-Notebook-Hp-240-G7-i3-10-Gera-o-8GB-SSD-256gb-Tela-14_1781620121.png\tUsado - Notebook Hp 240 G7 | i3 10ª Geração | 8GB | SSD 256gb | Tela 14\t2.040,00
https://www.kabum.com.br/produto/952259/usado-notebook-robusto-dell-2-em-1-latitude-extreme-7424-tela-14-core-i5-32gb-ssd-1tb-oth-produtos\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/952259/medium/USADO-Notebook-Robusto-Dell-2-Em-1-Latitude-Extreme-7424-Tela-14-Core-i5-32gb-SSD-1TB-OTH-PRODUTOS_1783965260.jpg\tUSADO -  Notebook Robusto Dell 2 Em 1, Latitude Extreme 7424, Tela 14", Core i5, 32gb, SSD-1TB - OTH PRODUTOS\t12.990,00
https://www.kabum.com.br/produto/1040755/usado-apple-macbook-pro-m2-2022-13-10core-256gb-ssd-8gb-ram-cinza-espacial-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040755/medium/Usado-Apple-Macbook-Pro-M2-2022-13-10core-256gb-SSD-8GB-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro M2 2022 13" 10core 256gb SSD 8GB Ram Cinza Espacial Bom - Trocafone\t4.899,00
https://www.kabum.com.br/produto/1020413/usado-lenovo-thinkpad-p15-intel-core-i7-16gb-ram-ssd-512gb-tela-fhd-15-6-windows-11-preto\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1020413/medium/Usado-Lenovo-Thinkpad-P15-Intel-Core-i7-16gb-Ram-SSD-512gb-Tela-Fhd-15-6-WINDOWS-11-Preto_1774625625.png\tUsado Lenovo Thinkpad P15 Intel Core i7 16gb Ram SSD 512gb Tela Fhd 15.6" WINDOWS 11 Preto\t5.990,00
https://www.kabum.com.br/produto/1034773/usado-apple-macbook-pro-m2-2022-13-10core-256gb-ssd-8gb-ram-cinza-espacial-muito-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1034773/medium/Usado-Apple-Macbook-Pro-M2-2022-13-10core-256gb-SSD-8GB-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1783965284.jpg\tUsado -  Apple Macbook Pro M2 2022 13" 10core 256gb SSD 8GB Ram Cinza Espacial Muito Bom - Trocafone\t5.209,00
https://www.kabum.com.br/produto/1040019/usado-notebook-hp-zbook-fury-g7-15-i7-10850h-16gb-512gb-cinza\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040019/medium/Usado-Notebook-Hp-Zbook-Fury-G7-15-i7-10850h-16gb-512gb-Cinza_1779212621.png\tUsado - Notebook Hp Zbook Fury G7 15" i7-10850h 16gb 512gb Cinza\t6.985,00
https://www.kabum.com.br/produto/902704/notebook-lenovo-ideapad-1-15amn7-amd-ryzen-5-7520u-8gb-512gb-ssd-windows-11-15-6-82x5000nbr-cloud-grey\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/902704/medium/Notebook-Lenovo-Ideapad-1-15amn7-AMD-Ryzen-5-7520u-8GB-512GB-SSD-15-6-WINDOWS-11-82x5000nbr-Cloud-Grey_1784923133.jpg\tNotebook Lenovo Ideapad 1 15amn7, AMD Ryzen 5 7520u, 8GB, 512GB SSD, 15.6", WINDOWS 11 - 82x5000nbr Cloud Grey\t4.998,48
https://www.kabum.com.br/produto/1040750/usado-apple-macbook-pro-m1-2021-14-10core-1tb-ssd-16gb-ram-cinza-espacial-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040750/medium/Usado-Apple-Macbook-Pro-M1-2021-14-10core-1TB-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro M1 2021 14" 10core 1TB SSD 16gb Ram Cinza Espacial Bom - Trocafone\t6.959,00
https://www.kabum.com.br/produto/1040747/usado-apple-macbook-pro-2019-16-intel-core-i7-512gb-ssd-16gb-ram-cinza-espacial-excelente-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040747/medium/Usado-Apple-Macbook-Pro-2019-16-Intel-Core-i7-512gb-SSD-16gb-Ram-Cinza-Espacial-Excelente-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro 2019 16" Intel Core i7 512gb SSD 16gb Ram Cinza Espacial Excelente - Trocafone\t5.079,00
https://www.kabum.com.br/produto/995741/usado-apple-macbook-pro-m1-2021-16-10core-512gb-ssd-16gb-ram-prateado-excelente\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/995741/medium/Usado-Apple-Macbook-Pro-M1-2021-16-10core-512gb-SSD-16gb-Ram-Prateado-Excelente_1783965283.jpg\tUsado -  Apple Macbook Pro M1 2021 16" 10core 512gb SSD 16gb Ram Prateado - Excelente\t6.689,00
https://www.kabum.com.br/produto/1040746/usado-apple-macbook-pro-2019-16-intel-core-i9-1tb-ssd-16gb-ram-cinza-espacial-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040746/medium/Usado-Apple-Macbook-Pro-2019-16-Intel-Core-i9-1TB-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro 2019 16" Intel Core i9 1TB SSD 16gb Ram Cinza Espacial Bom - Trocafone\t4.579,00
https://www.kabum.com.br/produto/1034772/usado-apple-macbook-pro-m1-2021-16-10core-512gb-ssd-16gb-ram-cinza-espacial-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1034772/medium/Usado-Apple-Macbook-Pro-M1-2021-16-10core-512gb-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1783965283.jpg\tUsado -  Apple Macbook Pro M1 2021 16" 10core 512gb SSD 16gb Ram Cinza Espacial Bom - Trocafone\t7.829,00
https://www.kabum.com.br/produto/833957/notebook-asus-vivobook-15-m1502ya-amd-ryzen-7-5825u-8gb-ram-512gb-ssd-linux-keepos-15-6-fhd-cool-silver-nj611\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/833957/medium/Notebook-Asus-Vivobook-15-M1502ya-Amd-Ryzen-7-5825u-8GB-Ram-512gb-SSD-Linux-Keepos-15-6-Fhd-Cool-Silver-Nj611_1785341312.jpg\tNotebook Asus Vivobook 15 M1502ya Amd Ryzen 7 5825u 8GB Ram 512gb SSD Linux Keepos 15,6" Fhd Cool Silver - Nj611\t3.484,15
https://www.kabum.com.br/produto/1040754/usado-apple-macbook-pro-m1-2020-13-8core-256gb-ssd-8gb-ram-space-gray-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040754/medium/Usado-Apple-Macbook-Pro-M1-2020-13-8core-256gb-SSD-8GB-Ram-Space-Gray-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro M1 2020 13" 8core 256gb SSD 8GB Ram Space Gray Bom - Trocafone\t4.529,00
https://www.kabum.com.br/produto/1040743/usado-apple-macbook-pro-2019-16-intel-core-i7-512gb-ssd-16gb-ram-cinza-espacial-muito-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040743/medium/Usado-Apple-Macbook-Pro-2019-16-Intel-Core-i7-512gb-SSD-16gb-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1779381524.jpg\tUsado -  Apple Macbook Pro 2019 16" Intel Core i7 512gb SSD 16gb Ram Cinza Espacial Muito Bom - Trocafone\t4.199,00
https://www.kabum.com.br/produto/959235/notebook-lenovo-ideapad-310-intel-core-i5\thttps://images.kabum.com.br/produtos/fotos/magalu/959235/medium/Notebook-Lenovo-Ideapad-310-Intel-Core-i5_1763582563.jpg\tNotebook Lenovo Ideapad 310 Intel Core i5\t2.599,00
https://www.kabum.com.br/produto/482556/notebook-concordia-c5215-intel-core-i7-1255u-32gb-ram-ssd-1tb-tela-15-6-full-hd-freedos\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/482556/medium/Notebook-Conc-rdia-C5215-Intel-Core-I7-1255u-32GB-RAM-SSD-1TB-Tela-15-6-Full-HD-FreeDos_1783605864.jpg\tNotebook Concórdia C5215, Intel Core I7-1255u, 32GB RAM, SSD 1TB, Tela 15.6" Full HD, FreeDos\t6.455,00
https://www.kabum.com.br/produto/995747/usado-apple-macbook-pro-m1-2021-16-10core-512gb-ssd-16gb-ram-cinza-espacial-excelente\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/995747/medium/Usado-Apple-Macbook-Pro-M1-2021-16-10core-512gb-SSD-16gb-Ram-Cinza-Espacial-Excelente_1783965284.jpg\tUsado -  Apple Macbook Pro M1 2021 16" 10core 512gb SSD 16gb Ram Cinza Espacial - Excelente\t8.649,00
https://www.kabum.com.br/produto/170826/notebook-compaq-presario-cq-29-intel-i5-5257u-8gb-ram-ddr3-ssd-480gb-tela-15-6-full-hd-windows-10-home-preto\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/170826/Notebook-Compaq-Presario-Cq-29-Intel-I5-5257u-8GB-RAM-DDR3-SSD-480GB-Tela-15-6-Full-HD-Windows-10-Home-Preto_1719513571_m.jpg\tNotebook Compaq Presario Cq-29 Intel I5 5257u, 8GB RAM DDR3, SSD 480GB, Tela 15.6 Full HD, Windows 10 Home, Preto\t3.005,99
https://www.kabum.com.br/produto/1018331/usado-apple-macbook-pro-a2141-intel-core-i7-2019-ssd-500gb-16gb-radeon-5300m-16-prateado\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1018331/medium/USADO-Apple-MacBook-Pro-A2141-Intel-Core-i7-2019-SSD-500GB-16GB-Radeon-5300M-16-Prateado_1773940133.png\tUSADO - Apple MacBook Pro A2141 Intel Core i7 2019 SSD 500GB 16GB Radeon 5300M 16" Prateado\t4.504,50
https://www.kabum.com.br/produto/1034770/usado-apple-macbook-pro-m1-2021-14-8core-512gb-ssd-16gb-ram-cinza-espacial-muito-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1034770/medium/Usado-Apple-Macbook-Pro-M1-2021-14-8core-512gb-SSD-16gb-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1783965283.jpg\tUsado -  Apple Macbook Pro M1 2021 14" 8core 512gb SSD 16gb Ram Cinza Espacial Muito Bom - Trocafone\t7.809,00
https://www.kabum.com.br/produto/945383/usado-macbook-pro-mvvl2ll-a-tela-16-core-i7-2-6ghz-16gb-ssd-512gb-4gb-dedicada-touchbar-prateado-oth-produtos\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/945383/medium/USADO-Macbook-Pro-Mvvl2ll-a-Tela-16-Core-i7-2-6ghz-16gb-SSD-512gb-4gb-Dedicada-Touchbar-Prateado-OTH-PRODUTOS_1783965285.jpg\tUSADO: Macbook Pro, Mvvl2ll/a, Tela 16",  Core i7 2.6ghz, 16gb, SSD 512gb, 4gb Dedicada, Touchbar - Prateado - OTH PRODUTOS\t5.490,00
https://www.kabum.com.br/produto/1040756/usado-apple-macbook-pro-m1-2021-14-8core-512gb-ssd-16gb-ram-cinza-espacial-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040756/medium/Usado-Apple-Macbook-Pro-M1-2021-14-8core-512gb-SSD-16gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro M1 2021 14" 8core 512gb SSD 16gb Ram Cinza Espacial Bom - Trocafone\t7.329,00
https://www.kabum.com.br/produto/1040749/usado-apple-macbook-pro-m1-max-2021-16-10core-1tb-ssd-32gb-ram-cinza-espacial-muito-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040749/medium/Usado-Apple-Macbook-Pro-M1-Max-2021-16-10core-1TB-SSD-32gb-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro M1 Max 2021 16" 10core 1TB SSD 32gb Ram Cinza Espacial Muito Bom - Trocafone\t10.999,00
https://www.kabum.com.br/produto/1020156/usado-apple-macbook-air-a2337-2020-m1-ssd-256gb-8gb-13-3-retina-touch-id-space-gray\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1020156/medium/Usado-Apple-Macbook-Air-A2337-2020-M1-SSD-256gb-8GB-13-3-Retina-Touch-Id-Space-Gray_1773939521.png\tUsado - Apple Macbook Air A2337 2020 M1 SSD 256gb 8GB 13.3" Retina Touch Id Space Gray\t5.029,50
https://www.kabum.com.br/produto/871869/usado-notebook-gamer-acer-helios-neo-phn16-71-72w6-i7-rtx-4060-16gb-512gb-16-165hz\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/871869/medium/Recondicionado-Notebook-Gamer-Acer-Helios-Neo-PHN16-71-72W6-i7-RTX-4060-16GB-512GB-16-165Hz_1770930830.jpg\tRecondicionado - Notebook Gamer Acer Helios Neo PHN16-71-72W6 i7 RTX 4060 16GB 512GB 16" 165Hz\t8.420,00
https://www.kabum.com.br/produto/945386/usado-macbook-air-mlxx3bz-a-2022-chip-m2-tela-13-6-8gb-ssd-512gb-cinza-espacial-oth-produtos\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/945386/medium/USADO-Macbook-Air-Mlxx3bz-a-2022-Chip-M2-Tela-13-6-8GB-SSD-512gb-Cinza-Espacial-OTH-PRODUTOS_1783965285.jpg\tUSADO: Macbook Air Mlxx3bz/a (2022) Chip M2, Tela 13.6", 8GB, SSD-512gb - Cinza Espacial - OTH PRODUTOS\t6.741,00
https://www.kabum.com.br/produto/945376/usado-macbook-pro-mvvl2ll-a-tela-16-core-i7-2-6ghz-16gb-ssd-512gb-4gb-dedicada-touchbar-cinza-espacial-oth-produtos\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/945376/medium/USADO-Macbook-Pro-Mvvl2ll-a-Tela-16-Core-i7-2-6ghz-16gb-SSD-512gb-4gb-Dedicada-Touchbar-Cinza-Espacial-OTH-PRODUTOS_1783965283.jpg\tUSADO: Macbook Pro, Mvvl2ll/a, Tela 16", Core i7 2.6ghz, 16gb, SSD-512gb, 4gb Dedicada, Touchbar - Cinza Espacial - OTH PRODUTOS\t4.990,00
https://www.kabum.com.br/produto/1035035/usado-apple-macbook-pro-m1-2021-16-10core-512gb-ssd-16gb-ram-cinza-espacial-muito-bom\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1035035/medium/Usado-Apple-Macbook-Pro-M1-2021-16-10core-512GB-SSD-16GB-RAM-Cinza-Espacial-Muito-Bom_1783965283.jpg\tUsado - Apple Macbook Pro M1 2021 16" 10core, 512GB SSD, 16GB RAM, Cinza Espacial - Muito Bom\t8.239,00
https://www.kabum.com.br/produto/959099/notebook-dell-inspiron-i15-5566-d10p-intel-core-i3\thttps://images.kabum.com.br/produtos/fotos/magalu/959099/medium/Notebook-Dell-Inspiron-i15-5566-D10P-Intel-Core-i3_1763582547.jpg\tNotebook Dell Inspiron i15-5566-D10P Intel Core i3\t2.399,00
https://www.kabum.com.br/produto/1040753/usado-apple-macbook-pro-m1-2020-13-8core-256gb-ssd-8gb-ram-space-gray-muito-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040753/medium/Usado-Apple-Macbook-Pro-M1-2020-13-8core-256gb-SSD-8GB-Ram-Space-Gray-Muito-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro M1 2020 13" 8core 256gb SSD 8GB Ram Space Gray Muito Bom - Trocafone\t4.819,00
https://www.kabum.com.br/produto/1040752/usado-apple-macbook-pro-m1-max-2021-16-10core-1tb-ssd-32gb-ram-cinza-espacial-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040752/medium/Usado-Apple-Macbook-Pro-M1-Max-2021-16-10core-1TB-SSD-32gb-Ram-Cinza-Espacial-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro M1 Max 2021 16" 10core 1TB SSD 32gb Ram Cinza Espacial Bom - Trocafone\t10.339,00
https://www.kabum.com.br/produto/959535/notebook-positivo-unique-s2500-intel-celeron\thttps://images.kabum.com.br/produtos/fotos/magalu/959535/medium/Notebook-Positivo-Unique-S2500-Intel-Celeron_1763582594.jpg\tNotebook Positivo Unique S2500 Intel Celeron\t1.099,00
https://www.kabum.com.br/produto/1040742/usado-apple-macbook-pro-m1-2020-13-8core-512gb-ssd-8gb-ram-space-gray-excelente-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040742/medium/Usado-Apple-Macbook-Pro-M1-2020-13-8core-512gb-SSD-8GB-Ram-Space-Gray-Excelente-Trocafone_1779381524.jpg\tUsado -  Apple Macbook Pro M1 2020 13" 8core 512gb SSD 8GB Ram Space Gray Excelente - Trocafone\t8.219,00
https://www.kabum.com.br/produto/1040741/usado-apple-macbook-pro-m1-2020-13-8core-512gb-ssd-8gb-ram-space-gray-muito-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040741/medium/Usado-Apple-Macbook-Pro-M1-2020-13-8core-512gb-SSD-8GB-Ram-Space-Gray-Muito-Bom-Trocafone_1779381524.jpg\tUsado -  Apple Macbook Pro M1 2020 13" 8core 512gb SSD 8GB Ram Space Gray Muito Bom - Trocafone\t5.209,00
https://www.kabum.com.br/produto/776333/usado-apple-macbook-pro-a2141-core-i7-9-gen-ssd-512gb-16gb-cinza-espacial\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/776333/medium/Usado-Apple-Macbook-Pro-A2141-Core-i7-9-gen-SSD-512gb-16gb-Cinza-Espacial_1783965266.jpg\tUsado - Apple Macbook Pro A2141 Core i7 9ªgen SSD 512gb 16gb - Cinza Espacial\t5.099,00
https://www.kabum.com.br/produto/1034774/usado-apple-macbook-pro-m1-2021-14-8core-512gb-ssd-16gb-ram-cinza-espacial-excelente-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1034774/medium/Usado-Apple-Macbook-Pro-M1-2021-14-8core-512gb-SSD-16gb-Ram-Cinza-Espacial-Excelente-Trocafone_1783965284.jpg\tUsado -  Apple Macbook Pro M1 2021 14" 8core 512gb SSD 16gb Ram Cinza Espacial Excelente - Trocafone\t8.219,00
https://www.kabum.com.br/produto/1040744/usado-apple-macbook-pro-m1-2021-14-10core-1tb-ssd-16gb-ram-cinza-espacial-excelente-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040744/medium/Usado-Apple-Macbook-Pro-M1-2021-14-10core-1TB-SSD-16gb-Ram-Cinza-Espacial-Excelente-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro M1 2021 14" 10core 1TB SSD 16gb Ram Cinza Espacial Excelente - Trocafone\t7.999,00
https://www.kabum.com.br/produto/989016/usado-macbook-pro-intel-core-i7-ssd-500gb-16gb-ddr4-tela-16-video-dedicado-amd-5300m-touch-id-touch-bar\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/989016/medium/Usado-Macbook-Pro-Intel-Core-i7-SSD-500gb-16gb-Ddr4-Tela-16-V-deo-Dedicado-Amd-5300m-Touch-Id-Touch-Bar_1783965284.jpg\tUsado - Macbook Pro  Intel Core i7 SSD 500gb 16gb Ddr4 Tela 16" Vídeo Dedicado Amd 5300m Touch Id Touch Bar\t4.790,00
https://www.kabum.com.br/produto/1020154/recondicionado-macbook-pro-a2251-core-i5-ssd-500gb-16gb-ddr4-tela-13-3-video-intel-touch-id-touch-bar\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1020154/medium/Recondicionado-Macbook-Pro-A2251-Core-i5-SSD-500gb-16gb-Ddr4-Tela-13-3-V-deo-Intel-Touch-Id-Touch-Bar_1783965285.png\tRecondicionado - Macbook Pro A2251 Core i5 SSD 500gb 16gb Ddr4 Tela 13.3" Vídeo Intel Touch Id Touch Bar\t4.084,50
https://www.kabum.com.br/produto/1040748/usado-apple-macbook-pro-m1-2021-14-10core-1tb-ssd-16gb-ram-cinza-espacial-muito-bom-trocafone\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1040748/medium/Usado-Apple-Macbook-Pro-M1-2021-14-10core-1TB-SSD-16gb-Ram-Cinza-Espacial-Muito-Bom-Trocafone_1779381525.jpg\tUsado -  Apple Macbook Pro M1 2021 14" 10core 1TB SSD 16gb Ram Cinza Espacial Muito Bom - Trocafone\t7.399,00
https://www.kabum.com.br/produto/959594/notebook-dell-inspiron-i15-5567-d40c-intel-core-i7\thttps://images.kabum.com.br/produtos/fotos/magalu/959594/medium/Notebook-Dell-Inspiron-i15-5567-D40C-Intel-Core-i7_1763582600.jpg\tNotebook Dell Inspiron i15-5567-D40C Intel Core i7\t4.199,00
https://www.kabum.com.br/produto/295177/confortable-mesa-para-notebook-inovakasa\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/295177/medium/Confortable-Mesa-Para-Notebook-Inovakasa_1771932216.jpg\tConfortable Mesa Para Notebook Inovakasa\t64,71
https://www.kabum.com.br/produto/1021422/usado-apple-macbook-pro-a2779-m2-pro-16gb-ram-ssd-500gb-14-2-retina-xdr-touch-id-space-gray\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1021422/medium/Usado-Apple-Macbook-Pro-A2779-M2-Pro-16gb-Ram-SSD-500gb-14-2-Retina-Xdr-Touch-Id-Space-Gray_1774291718.png\tUsado - Apple Macbook Pro A2779 M2 Pro 16gb Ram SSD 500gb 14.2" Retina Xdr Touch Id Space Gray\t12.169,50
https://www.kabum.com.br/produto/959013/notebook-2-em-1-dell-inspiron-i13-5378-b40c\thttps://images.kabum.com.br/produtos/fotos/magalu/959013/medium/Notebook-2-em-1-Dell-Inspiron-i13-5378-B40C-_1763582537.jpg\tNotebook 2 em 1 Dell Inspiron i13-5378-B40C\t5.099,90
https://www.kabum.com.br/produto/960050/notebook-dell-inspiron-i15-5567-d30c-intel-core-i5\thttps://images.kabum.com.br/produtos/fotos/magalu/960050/medium/Notebook-Dell-Inspiron-i15-5567-D30C-Intel-Core-i5_1763582650.jpg\tNotebook Dell Inspiron i15-5567-D30C Intel Core i5\t3.649,00
https://www.kabum.com.br/produto/988953/usado-macbook-pro-m1-usado-8-cores-ssd-500gb-16gb-ddr4-tela-14-2-video-dedicado-apple-touch-id\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/988953/medium/Usado-Macbook-Pro-M1-A2442-8-Cores-SSD-500gb-16gb-Ddr4-Tela-14-2-V-deo-Dedicado-Apple_1783965284.png\tUsado -  Macbook Pro M1 A2442  8 Cores SSD 500gb 16gb Ddr4 Tela 14,2" Vídeo Dedicado Apple\t8.284,50
https://www.kabum.com.br/produto/959095/notebook-2-em-1-dell-inspiron-15-i15-5578-a10c\thttps://images.kabum.com.br/produtos/fotos/magalu/959095/medium/Notebook-2-em-1-Dell-Inspiron-15-i15-5578-A10C-_1763582547.jpg\tNotebook 2 em 1 Dell Inspiron 15 i15-5578-A10C\t3.899,00
https://www.kabum.com.br/produto/435658/notebook-asus-rog-zephyrus-m16-intel-13-geracao-i9-13900h-16gb-ram-rtx-4070-tela-16-qhd-ssd-1tb-nvme\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/435658/medium/Notebook-Asus-Rog-Zephyrus-M16-Intel-13-Gera-o-i9-13900h-16GB-RAM-RTX-4070-Tela-16-QHD-SSD-1TB-NVME_1744719078.jpg\tNotebook Asus Rog Zephyrus M16 Intel 13ª Geração i9-13900h 16GB RAM RTX 4070 Tela 16'' QHD SSD 1TB NVME\t15.120,00
https://www.kabum.com.br/produto/959520/notebook-2-em-1-dell-inspiron-i15-5578-b10c\thttps://images.kabum.com.br/produtos/fotos/magalu/959520/medium/Notebook-2-em-1-Dell-Inspiron-i15-5578-B10C-_1763582593.jpg\tNotebook 2 em 1 Dell Inspiron i15-5578-B10C\t4.199,00
https://www.kabum.com.br/produto/959440/notebook-hp-pavilion-dv6-6c50br-amd-a6-quad-core\thttps://images.kabum.com.br/produtos/fotos/magalu/959440/medium/Notebook-HP-Pavilion-DV6-6C50BR-AMD-A6-Quad-Core_1763582584.jpg\tNotebook HP Pavilion DV6-6C50BR AMD A6 Quad Core\t2.799,00
https://www.kabum.com.br/produto/624607/controle-usb-com-fio-compativel-com-xbox-360-computador-notebook-preto\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/624607/medium/Controle-Usb-Com-Fio-Compat-vel-Com-XBOX-360-Computador-Notebook-Preto_1748266186.jpg\tControle Usb Com Fio Compatível Com XBOX 360 Computador Notebook Preto\t149,90
https://www.kabum.com.br/produto/959888/notebook-hp-pavilion-dv6-6c60br-amd-a6-quad-core\thttps://images.kabum.com.br/produtos/fotos/magalu/959888/medium/Notebook-HP-Pavilion-DV6-6C60BR-AMD-A6-Quad-Core_1763582633.jpg\tNotebook HP Pavilion DV6-6C60BR AMD A6 Quad Core\t2.799,00
https://www.kabum.com.br/produto/278424/suporte-para-notebook-17-knup-base-com-cooler-iluminacao\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/278424/Suporte-Base-Para-Notebook-Com-Cooler-E-Ilumina-o-At-17-Polegadas_1638303100_m.jpg\tSuporte Para Notebook 17 Knup Base, Com Cooler, Iluminação\t109,56
https://www.kabum.com.br/produto/1020153/usado-apple-macbook-pro-a2485-2021-m1-pro-16gb-ssd-512gb-16-space-gray\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1020153/medium/Usado-Apple-Macbook-Pro-A2485-2021-M1-Pro-max-16gb-SSD-512gb-16-Space-Gray_1774383242.png\tUsado - Apple Macbook Pro A2485 2021 M1 max  32gb SSD 1TB 16" Space Gray\t14.164,50
https://www.kabum.com.br/produto/1023724/usado-apple-macbook-pro-a2485-m1-pro-16gb-500gb-ssd-16-space-gray\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/1023724/medium/Usado-Apple-Macbook-Pro-A2485-M1-Pro-16gb-500gb-SSD-16-Space-Gray_1774898318.png\tUsado Apple Macbook Pro A2485 M1 Pro 16gb 500gb SSD 16" Space Gray\t12.169,50
https://www.kabum.com.br/produto/947904/apple-macbook-air-15-m4-com-cpu-de-10nucleos-gpu-de-10nucleos-16gb-ram-256gb-ssd-meia-noite\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/947904/medium/Apple-Macbook-Air-15-M4-Com-Cpu-De-10-n-cleos-Gpu-De-10-n-cleos-16gb-Ram-256gb-SSD-Meia-noite_1785532425.jpg\tApple Macbook Air 15", M4,  Com Cpu De 10 núcleos, Gpu De 10 núcleos, 16gb Ram, 256gb SSD - Meia-noite\t16.695,64
https://www.kabum.com.br/produto/608515/bateria-para-notebook-dell-part-number-batcl50l61-4000-mah\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/608515/medium/Bateria-Para-Notebook-Dell-Part-Number-Batcl50l61_1784520827.jpg\tBateria Para Notebook Dell Part Number Batcl50l61\t114,74
https://www.kabum.com.br/produto/877248/bateria-para-notebook-emachines-d732\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877248/medium/Bateria-Para-Notebook-Emachines-D732_1747935003.jpg\tBateria Para Notebook Emachines D732\t157,18
https://www.kabum.com.br/produto/877179/bateria-para-notebook-acer-aspire-e1-571-6_br642\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877179/medium/Bateria-Para-Notebook-Acer-Aspire-E1-571-6-br642_1747935000.jpg\tBateria Para Notebook Acer Aspire E1-571-6_br642\t157,18
https://www.kabum.com.br/produto/877083/bateria-para-notebook-emachines-e732\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877083/medium/Bateria-Para-Notebook-Emachines-E732_1747934996.jpg\tBateria Para Notebook Emachines E732\t157,18
https://www.kabum.com.br/produto/985905/apple-macbook-air-2025-15-3-pol-m4-16gb-256gb-midnight-mw1l3ll-a\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/985905/medium/Apple-Macbook-Air-2025-15-3-Pol-M4-16gb-256gb-Midnight-Mw1l3ll-a_1765832614.jpg\tApple Macbook Air (2025) 15.3 Pol M4 16gb 256gb Midnight - Mw1l3ll/a\t10.999,00
https://www.kabum.com.br/produto/876952/bateria-para-notebook-acer-aspire-e1-571-6490\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876952/medium/Bateria-Para-Notebook-Acer-Aspire-E1-571-6490_1747934991.jpg\tBateria Para Notebook Acer Aspire E1-571-6490\t157,18
https://www.kabum.com.br/produto/877444/bateria-para-notebook-acer-aspire-5750-6_br824\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877444/medium/Bateria-Para-Notebook-Acer-Aspire-5750-6-br824_1747935297.jpg\tBateria Para Notebook Acer Aspire 5750-6_br824\t157,18
https://www.kabum.com.br/produto/877378/bateria-para-notebook-acer-7551-2560\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877378/medium/Bateria-Para-Notebook-Acer-7551-2560_1747935297.jpg\tBateria Para Notebook Acer 7551-2560\t157,18
https://www.kabum.com.br/produto/877324/bateria-para-notebook-emachines-e640\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877324/medium/Bateria-Para-Notebook-Emachines-E640_1747935285.jpg\tBateria Para Notebook Emachines E640\t157,18
https://www.kabum.com.br/produto/876453/bateria-para-notebook-emachines-e730\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876453/medium/Bateria-Para-Notebook-Emachines-E730_1747934716.jpg\tBateria Para Notebook Emachines E730\t157,18
https://www.kabum.com.br/produto/876656/bateria-para-notebook-acer-aspire-as5350-2828\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876656/medium/Bateria-Para-Notebook-Acer-Aspire-As5350-2828_1747934725.jpg\tBateria Para Notebook Acer Aspire As5350-2828\t157,18
https://www.kabum.com.br/produto/876920/bateria-para-notebook-acer-aspire-as5750-6651\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876920/medium/Bateria-Para-Notebook-Acer-Aspire-As5750-6651_1747934990.jpg\tBateria Para Notebook Acer Aspire As5750-6651\t157,18
https://www.kabum.com.br/produto/877220/bateria-para-notebook-emachines-e640\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877220/medium/Bateria-Para-Notebook-Emachines-E640_1747935002.jpg\tBateria Para Notebook Emachines E640\t157,18
https://www.kabum.com.br/produto/877363/bateria-para-notebook-acer-aspire-e1-531-e1-571-v3-771-5733-5741\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877363/medium/Bateria-Para-Notebook-Acer-Aspire-E1-531-E1-571-V3-771-5733-5741_1747935297.jpg\tBateria Para Notebook Acer Aspire E1-531 E1-571 V3-771 5733 5741\t157,18
https://www.kabum.com.br/produto/603852/bateria-para-notebook-dell-part-number-batel80l9-4000-mah-\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/603852/medium/Bateria-Para-Notebook-Dell-Part-Number-Batel80l9-4000-Mah-_1784628817.jpg\tBateria Para Notebook Dell Part Number Batel80l9 | 4000 Mah.\t114,74
https://www.kabum.com.br/produto/876679/bateria-para-notebook-emachines-e-series-e443\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876679/medium/Bateria-Para-Notebook-Emachines-E-Series-E443_1747934726.jpg\tBateria Para Notebook Emachines E Series E443\t157,18
https://www.kabum.com.br/produto/876767/bateria-para-notebook-gateway-nv49c\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876767/medium/Bateria-Para-Notebook-Gateway-Nv49c_1747934730.jpg\tBateria Para Notebook Gateway Nv49c\t157,18
https://www.kabum.com.br/produto/876418/bateria-para-notebook-acer-aspire-4739-6886\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876418/medium/Bateria-Para-Notebook-Acer-Aspire-4739-6886_1747934714.jpg\tBateria Para Notebook Acer Aspire 4739-6886\t157,18
https://www.kabum.com.br/produto/877348/bateria-para-notebook-emachines-d732g\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877348/medium/Bateria-Para-Notebook-Emachines-D732g_1747935292.jpg\tBateria Para Notebook Emachines D732g\t157,18
https://www.kabum.com.br/produto/876077/bateria-para-notebook-acer-aspire-4560\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876077/medium/Bateria-Para-Notebook-Acer-Aspire-4560_1747918786.jpg\tBateria Para Notebook Acer Aspire 4560\t157,18
https://www.kabum.com.br/produto/877058/bateria-para-notebook-gateway-nv51m\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877058/medium/Bateria-Para-Notebook-Gateway-Nv51m_1747934995.jpg\tBateria Para Notebook Gateway Nv51m\t157,18
https://www.kabum.com.br/produto/876610/bateria-para-notebook-acer-aspire-5741\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876610/medium/Bateria-Para-Notebook-Acer-Aspire-5741_1747934723.jpg\tBateria Para Notebook Acer Aspire 5741\t157,18
https://www.kabum.com.br/produto/877262/bateria-para-notebook-acer-aspire-5750-6464\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877262/medium/Bateria-Para-Notebook-Acer-Aspire-5750-6464_1747935004.jpg\tBateria Para Notebook Acer Aspire 5750-6464\t157,18
https://www.kabum.com.br/produto/876055/bateria-para-notebook-acer-aspire-e1-421-e1-471-e1-531-e1-571\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876055/medium/Bateria-Para-Notebook-Acer-Aspire-E1-421-E1-471-E1-531-E1-571_1747918787.jpg\tBateria Para Notebook Acer Aspire E1-421 E1-471 E1-531 E1-571\t157,18
https://www.kabum.com.br/produto/876798/bateria-para-notebook-gateway-ne56r05b\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876798/medium/Bateria-Para-Notebook-Gateway-Ne56r05b_1747934732.jpg\tBateria Para Notebook Gateway Ne56r05b\t157,18
https://www.kabum.com.br/produto/876825/bateria-para-notebook-acer-v3-571g-73616g75makk\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876825/medium/Bateria-Para-Notebook-Acer-V3-571g-73616g75makk_1747934733.jpg\tBateria Para Notebook Acer V3-571g-73616g75makk\t157,18
https://www.kabum.com.br/produto/876729/bateria-para-notebook-acer-tm5742-x742df\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876729/medium/Bateria-Para-Notebook-Acer-Tm5742-x742df_1747934728.jpg\tBateria Para Notebook Acer Tm5742-x742df\t157,18
https://www.kabum.com.br/produto/877088/bateria-para-notebook-emachines-d732z\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877088/medium/Bateria-Para-Notebook-Emachines-D732z_1747934997.jpg\tBateria Para Notebook Emachines D732z\t157,18
https://www.kabum.com.br/produto/877364/bateria-para-notebook-emachines-d728\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877364/medium/Bateria-Para-Notebook-Emachines-D728_1747935294.jpg\tBateria Para Notebook Emachines D728\t157,18
https://www.kabum.com.br/produto/877080/bateria-para-notebook-emachines-d440\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877080/medium/Bateria-Para-Notebook-Emachines-D440_1747934996.jpg\tBateria Para Notebook Emachines D440\t157,18
https://www.kabum.com.br/produto/876481/bateria-para-notebook-emachines-e732g\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876481/medium/Bateria-Para-Notebook-Emachines-E732g_1747934717.jpg\tBateria Para Notebook Emachines E732g\t157,18
https://www.kabum.com.br/produto/876060/bateria-para-notebook-aspire-5750-as10d31\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876060/medium/Bateria-Para-Notebook-Aspire-5750-As10d31_1747918787.jpg\tBateria Para Notebook Aspire 5750 As10d31\t157,18
https://www.kabum.com.br/produto/877121/bateria-para-notebook-emachines-e732g\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877121/medium/Bateria-Para-Notebook-Emachines-E732g_1747934998.jpg\tBateria Para Notebook Emachines E732g\t157,18
https://www.kabum.com.br/produto/876913/bateria-para-notebook-acer-travelmate-5742\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876913/medium/Bateria-Para-Notebook-Acer-Travelmate-5742_1747934989.jpg\tBateria Para Notebook Acer Travelmate 5742\t157,18
https://www.kabum.com.br/produto/876858/bateria-para-notebook-acer-tm5742-x732of\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876858/medium/Bateria-Para-Notebook-Acer-Tm5742-x732of_1747934987.jpg\tBateria Para Notebook Acer Tm5742-x732of\t157,18
https://www.kabum.com.br/produto/876090/bateria-para-notebook-acer-aspire-e1-421-0622\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876090/medium/Bateria-Para-Notebook-Acer-Aspire-E1-421-0622_1747918785.jpg\tBateria Para Notebook Acer Aspire E1-421-0622\t157,18
https://www.kabum.com.br/produto/877138/bateria-para-notebook-acer-aspire-5750-6842\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877138/medium/Bateria-Para-Notebook-Acer-Aspire-5750-6842_1747934999.jpg\tBateria Para Notebook Acer Aspire 5750-6842\t157,18
https://www.kabum.com.br/produto/877167/bateria-para-notebook-acer-tm5740-x322\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877167/medium/Bateria-Para-Notebook-Acer-Tm5740-x322_1747935000.jpg\tBateria Para Notebook Acer Tm5740-x322\t157,18
https://www.kabum.com.br/produto/877412/bateria-para-notebook-acer-aspire-e1-571-6880\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877412/medium/Bateria-Para-Notebook-Acer-Aspire-E1-571-6880_1747935298.jpg\tBateria Para Notebook Acer Aspire E1-571-6880\t157,18
https://www.kabum.com.br/produto/876368/bateria-para-notebook-acer-as10d31\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876368/medium/Bateria-Para-Notebook-Acer-As10d31_1747934712.jpg\tBateria Para Notebook Acer As10d31\t157,18
https://www.kabum.com.br/produto/876466/bateria-para-notebook-acer-tm5742-x732d\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876466/medium/Bateria-Para-Notebook-Acer-Tm5742-x732d_1747934717.jpg\tBateria Para Notebook Acer Tm5742-x732d\t157,18
https://www.kabum.com.br/produto/876138/bateria-para-notebook-emachines-d528\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/876138/medium/Bateria-Para-Notebook-Emachines-D528_1747918788.jpg\tBateria Para Notebook Emachines D528\t157,18
https://www.kabum.com.br/produto/877091/bateria-para-notebook-acer-aspire-5750-6_br8684\thttps://images.kabum.com.br/produtos/fotos/sync_mirakl/877091/medium/Bateria-Para-Notebook-Acer-Aspire-5750-6-br8684_1747934997.jpg\tBateria Para Notebook Acer Aspire 5750-6_br8684\t157,18
`;

const BRANDS = [
  { match: /apple|macbook/i, name: "Apple" },
  { match: /dell/i, name: "Dell" },
  { match: /hp|compaq|elitebook|zbook|pavilion/i, name: "HP" },
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
    .slice(0, 80);
}

function extractSpecs(name) {
  const specs = {};
  const storage =
    name.match(/SSD[\s-]*(\d+\s*(?:gb|tb)[a-z ]*)/i) ||
    name.match(/SSD[\s-]*(\d+)/i);
  if (storage) specs["Armazenamento"] = `SSD ${storage[1].trim().replace(/\s+/g, " ").toUpperCase()}`;
  const ram =
    name.match(/(\d+)\s*(?:gb)\s*(?:ram|mem|ddr\d*|de mem|memoria)/i) ||
    name.match(/(\d+)\s*gb\s+\d+\s*(?:gb|ssd)/i);
  if (ram) specs["Memória"] = `${ram[1]}GB`;
  const tela = name.match(/Tela\s*([\d,."]+)/i);
  if (tela) specs["Tela"] = `${tela[1].replace(/["]/g, "")}"`;
  const gpu = name.match(
    /RTX\s*\d+\s*[a-z0-9]*|GTX\s*\d+\s*[a-z0-9]*|Vega\s*\d+|Radeon\s*[a-z0-9]+|Nvidia\s*[a-zA-Z0-9]+|Intel\s*[a-zA-Z0-9 ]*UHD|Iris\s*Xe/i
  );
  if (gpu) specs["Placa de Vídeo"] = gpu[0].trim();
  const cpu = name.match(/Core\s*i\d[\w-]*|Ryzen\s*\d[\w\s]*|Apple\s*M\d|Intel\s*Celeron|Core\s*[iI]-?\d/i);
  if (cpu) specs["Processador"] = cpu[0].trim();
  return specs;
}

function makeDescription(name) {
  const used = /usado|recondicionado|seminovo/i.test(name);
  return used
    ? "Equipamento seminovo revisado e testado por nossa equipe, pronto para uso. Procedência verificada, garantia inclusa e suporte técnico em Campinas."
    : "Produto novo com procedência garantida. Consulte disponibilidade, retirada e entrega direto com nossa equipe em Campinas.";
}

function cleanCell(value) {
  let s = String(value ?? "").trim();
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) s = s.slice(1, -1);
  s = s.replace(/""/g, '"');
  return s.replace(/\s+/g, " ").trim();
}

function parsePrice(value) {
  const cleaned = String(value)
    .replace(/R\$/gi, "")
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function kabumIdFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (!/kabum\.com\.br$/.test(parsed.hostname)) return null;
    const m = parsed.pathname.match(/^\/produto\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function highRes(image) {
  if (!image) return "";
  return image.replace(/\/medium\//, "/large/");
}

async function fetchKabumGallery(productId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`https://www.kabum.com.br/produto/${productId}`, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    if (res.status === 403 || res.status === 429 || !res.ok) return null;
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) return null;
    const data = JSON.parse(match[1]);
    const product = data?.props?.pageProps?.product;
    if (!product || !Array.isArray(product.medias)) return null;
    const gallery = [];
    for (const media of product.medias) {
      if (media?.type && media.type !== "image") continue;
      const imgs = media?.images || {};
      const url = imgs?.gg || imgs?.g || imgs?.m || imgs?.p;
      if (url && url.startsWith("http")) gallery.push(url);
      if (gallery.length >= 4) break;
    }
    return { gallery };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const lines = RAW.split("\n").map((l) => l.trim()).filter(Boolean);
  const usedUrls = new Set();
  const usedSlugs = new Map();
  const products = [];
  let enrichedCount = 0;
  let skipped = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split("\t");
    if (cols.length < 4) continue;

    const url = cols[0].trim();
    if (!url.startsWith("http")) continue;
    if (usedUrls.has(url)) {
      skipped++;
      continue;
    }
    usedUrls.add(url);

    const image = cols[1].trim();
    const price = parsePrice(cols[cols.length - 1]);
    const nameParts = cols.slice(2, -1);
    const name = cleanCell(nameParts.length ? nameParts.join(" ") : cols[2]);
    if (!name || !price) {
      skipped++;
      continue;
    }

    let slug = slugify(name);
    const count = usedSlugs.get(slug) ?? 0;
    usedSlugs.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;

    const isUsed = /usado|recondicionado|seminovo/i.test(name);
    const badge = /recondicionado/i.test(name) ? "Recondicionado" : isUsed ? "Seminovo" : undefined;

    const productId = kabumIdFromUrl(url);
    let gallery = [];
    if (productId) {
      const info = await fetchKabumGallery(productId);
      if (info?.gallery?.length) {
        gallery = info.gallery;
        enrichedCount++;
      }
    }

    products.push({
      id: slug,
      slug,
      name,
      price: price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      image: gallery[0] || highRes(image) || image || "/logo.png",
      category: brandOf(name),
      badge,
      description: makeDescription(name),
      specs: extractSpecs(name),
      ...(gallery.length > 1 ? { image_urls: gallery } : {}),
      product_url: url,
    });

    if (i % 10 === 0) console.log(`  > ${i + 1}/${lines.length} processados...`);
    await sleep(300);
  }

  writeFileSync(OUT, JSON.stringify(products, null, 2) + "\n", "utf8");
  console.log(`\nCatálogo gerado: ${products.length} produtos (${skipped} linhas ignoradas).`);
  console.log(`Galeria em alta resolução (xlarge) para ${enrichedCount} produtos.`);
  const byBrand = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log("Por categoria:", JSON.stringify(byBrand, null, 2));
  const noGallery = products.filter((p) => !p.image_urls?.length);
  console.log(`Sem galeria múltipla (fallback large): ${noGallery.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});