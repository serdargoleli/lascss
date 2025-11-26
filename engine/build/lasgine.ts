import { startWatcher } from "../engine/watcher";

startWatcher({
    scanDirs: ['src/template'], // TODO: burayı configden oku
    extensions: ['.html', '.js', '.jsx', '.ts', '.tsx'], // değişklikleri izlenecek uzantılar
    outputPath: './public/las.css' // üretilen css dosyasının yolu
});