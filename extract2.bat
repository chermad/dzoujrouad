@echo off
setlocal enabledelayedexpansion

REM ============================================
REM Script pour regrouper un projet Next.js
REM Version CORRIGÉE - Tout en un fichier
REM ============================================

echo.
echo ***************************************
echo *  BUNDLE NEXT.JS - TOUT EN UN       *
echo ***************************************
echo.

REM Configuration
set "PROJECT_DIR=%CD%"
set "OUTPUT_FILE=%PROJECT_DIR%\le code projet en total.txt"
set "TIMESTAMP=%DATE% %TIME%"

echo [%TIMESTAMP%] Creation du bundle unique...
echo.

REM 1. Nettoyer le fichier de sortie
if exist "%OUTPUT_FILE%" del "%OUTPUT_FILE%"

REM 2. En-tête du fichier
echo ======================================================= >> "%OUTPUT_FILE%"
echo BUNDLE COMPLET DU PROJET NEXT.JS                      >> "%OUTPUT_FILE%"
echo ======================================================= >> "%OUTPUT_FILE%"
echo Date: %TIMESTAMP%                                      >> "%OUTPUT_FILE%"
echo Dossier: %PROJECT_DIR%                                 >> "%OUTPUT_FILE%"
echo Dossiers inclus: app, components, lib                  >> "%OUTPUT_FILE%"
echo ======================================================= >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

REM 3. Variables
set "EXTENSIONS=.ts .tsx .js .jsx .css .json .md .txt .env"
set "ROOT_FILES=package.json next.config.js next.config.ts tailwind.config.js tailwind.config.ts tsconfig.json"
set "FILES_PROCESSED=0"

REM 4. SECTION 1: ARBORESCENCE COMPLETE
echo [SECTION 1] ARBORESCENCE DU PROJET                     >> "%OUTPUT_FILE%"
echo ======================================================= >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

REM Fonction pour afficher l'arborescence
for %%d in (app components lib) do (
    if exist "%%d" (
        echo DOSSIER: \%%d                                   >> "%OUTPUT_FILE%"
        echo ------------------------------------------------- >> "%OUTPUT_FILE%"
        
        REM Utiliser dir avec /s pour afficher récursivement
        dir "%%d" /b /s 2>nul | findstr /v "\\node_modules\\ \\\.next\\" >> "%OUTPUT_FILE%"
        
        echo. >> "%OUTPUT_FILE%"
    )
)

echo ======================================================= >> "%OUTPUT_FILE%"
echo FIN DE L'ARBORESCENCE                                  >> "%OUTPUT_FILE%"
echo ======================================================= >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

REM 5. SECTION 2: CONTENU DES FICHIERS
echo [SECTION 2] CONTENU COMPLET DES FICHIERS               >> "%OUTPUT_FILE%"
echo ======================================================= >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

REM 5.1 Fichiers de configuration racine
echo [SOUS-SECTION 2.1] FICHIERS DE CONFIGURATION RACINE    >> "%OUTPUT_FILE%"
echo ------------------------------------------------------- >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

for %%f in (%ROOT_FILES%) do (
    if exist "%%f" (
        set /a FILES_PROCESSED+=1
        
        echo [FICHIER !FILES_PROCESSED!] \%%f               >> "%OUTPUT_FILE%"
        echo ************************************************ >> "%OUTPUT_FILE%"
        type "%%f" >> "%OUTPUT_FILE%" 2>nul
        
        if errorlevel 1 (
            echo [ERREUR: Fichier binaire ou inaccessible]   >> "%OUTPUT_FILE%"
        )
        
        echo. >> "%OUTPUT_FILE%"
        echo ************************************************ >> "%OUTPUT_FILE%"
        echo. >> "%OUTPUT_FILE%"
        echo Traite: %%f
    )
)

REM 5.2 Fichiers des dossiers app, components, lib - CORRECTION ICI
echo [SOUS-SECTION 2.2] FICHIERS DES DOSSIERS SPECIFIQUES   >> "%OUTPUT_FILE%"
echo ------------------------------------------------------- >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

for %%d in (app components lib) do (
    if exist "%%d" (
        echo [DOSSIER: \%%d]                                 >> "%OUTPUT_FILE%"
        echo =============================================== >> "%OUTPUT_FILE%"
        echo. >> "%OUTPUT_FILE%"
        
        echo Recherche des fichiers dans \%%d...
        
        REM PARCOURIR RÉCURSIVEMENT avec dir et for /f
        for /f "delims=" %%f in ('dir "%%d" /b /s /a-d 2^>nul') do (
            set "file_path=%%f"
            set "file_ext=%%~xf"
            
            REM Vérifier l'extension
            set "include_file=0"
            for %%e in (%EXTENSIONS%) do (
                if /i "!file_ext!"=="%%e" set "include_file=1"
            )
            
            REM Exclure certains dossiers
            set "exclude_file=0"
            for %%x in (node_modules .next .git) do (
                echo "!file_path!" | findstr /i "\\%%x\\" >nul && set "exclude_file=1"
            )
            
            REM Traiter le fichier
            if "!include_file!"=="1" if "!exclude_file!"=="0" (
                set /a FILES_PROCESSED+=1
                set "relative_path=%%f"
                set "relative_path=!relative_path:%PROJECT_DIR%=!"
                
                echo [FICHIER !FILES_PROCESSED!] !relative_path! >> "%OUTPUT_FILE%"
                echo ------------------------------------------- >> "%OUTPUT_FILE%"
                
                REM Lire le contenu - essayer d'abord avec type
                type "%%f" >> "%OUTPUT_FILE%" 2>nul
                
                if errorlevel 1 (
                    REM Essayer avec autre méthode
                    echo [CONTENU NON DISPONIBLE - Fichier peut-etre binaire] >> "%OUTPUT_FILE%"
                )
                
                echo. >> "%OUTPUT_FILE%"
                echo ------------------------------------------- >> "%OUTPUT_FILE%"
                echo. >> "%OUTPUT_FILE%"
                
                echo Traite: !relative_path!
            )
        )
        
        echo. >> "%OUTPUT_FILE%"
        echo =============================================== >> "%OUTPUT_FILE%"
        echo. >> "%OUTPUT_FILE%"
    )
)

REM 6. SECTION 3: FICHIER .ENV (STRUCTURE SEULEMENT)
if exist ".env.local" (
    echo [SECTION 3] FICHIER .ENV.LOCAL (STRUCTURE)          >> "%OUTPUT_FILE%"
    echo ======================================================= >> "%OUTPUT_FILE%"
    echo. >> "%OUTPUT_FILE%"
    
    set /a FILES_PROCESSED+=1
    echo [FICHIER !FILES_PROCESSED!] \.env.local             >> "%OUTPUT_FILE%"
    echo ************************************************ >> "%OUTPUT_FILE%"
    echo NOTA: Les valeurs sensibles sont masquees           >> "%OUTPUT_FILE%"
    echo ************************************************ >> "%OUTPUT_FILE%"
    echo. >> "%OUTPUT_FILE%"
    
    REM Afficher seulement les noms des variables
    for /f "usebackq tokens=1 delims==" %%a in (".env.local") do (
        set "line=%%a"
        if not "!line!"=="" (
            for /f "tokens=1 delims==" %%v in ("!line!") do (
                echo %%v=***VALUE_MASQUEE***        >> "%OUTPUT_FILE%"
            )
        )
    )
    
    echo. >> "%OUTPUT_FILE%"
    echo ************************************************ >> "%OUTPUT_FILE%"
    echo. >> "%OUTPUT_FILE%"
    
    echo Traite: .env.local (structure masquee)
)

REM 7. PIED DE PAGE
echo. >> "%OUTPUT_FILE%"
echo ======================================================= >> "%OUTPUT_FILE%"
echo RESUMÉ FINAL                                            >> "%OUTPUT_FILE%"
echo ======================================================= >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"
echo Nombre total de fichiers: %FILES_PROCESSED%             >> "%OUTPUT_FILE%"
echo Dossiers inclus: app, components, lib                  >> "%OUTPUT_FILE%"
echo Date de generation: %TIMESTAMP%                        >> "%OUTPUT_FILE%"
echo ======================================================= >> "%OUTPUT_FILE%"
echo FIN DU BUNDLE                                          >> "%OUTPUT_FILE%"
echo ======================================================= >> "%OUTPUT_FILE%"

REM 8. Résumé à l'écran
echo.
echo ============================================
echo BUNDLE TERMINE !
echo ============================================
echo.
echo Fichier cree: "%OUTPUT_FILE%"
echo.
echo Statistiques:
echo - Fichiers traites: %FILES_PROCESSED%
echo - Dossiers inclus: app, components, lib
echo.
echo Structure du fichier:
echo 1. Arborescence complete
echo 2. Contenu des fichiers de configuration
echo 3. Contenu des fichiers app/, components/, lib/
echo 4. Structure .env.local (valeurs masquees)
echo 5. Resume final
echo.
echo Appuyez sur une touche pour ouvrir le fichier...
pause >nul

REM Ouvrir le fichier avec l'éditeur par défaut
start "" "%OUTPUT_FILE%"

endlocal