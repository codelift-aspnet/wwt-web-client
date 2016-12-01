FROM microsoft/iis

ENV ASPNET_URLS="http://*:80" \
    ASPNET_ENVIRONMENT="Production" \
    chocolateyUseWindowsCompression="false"

RUN powershell iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
RUN powershell add-windowsfeature web-asp-net45 \
    && choco install microsoft-build-tools -y --allow-empty-checksums -version 14.0.23107.10 \
    && choco install dotnet4.6-targetpack --allow-empty-checksums -y \
    && choco install nuget.commandline --allow-empty-checksums -y \
    && nuget install MSBuild.Microsoft.VisualStudio.Web.targets -Version 14.0.0.3 \
    && nuget install WebConfigTransformRunner -Version 1.0.0.1 \
    && powershell remove-item C:\inetpub\wwwroot\iisstart.*
RUN md c:\build
WORKDIR c:/build
COPY . c:/build
RUN nuget restore \
    && "c:\Program Files (x86)\MSBuild\14.0\Bin\MSBuild.exe" /p:Platform="Any CPU" /p:VisualStudioVersion=12.0 /p:VSToolsPath=c:\MSBuild.Microsoft.VisualStudio.Web.targets.14.0.0.3\tools\VSToolsPath WebClientOnly.sln \
    && xcopy c:\build\webclient\* c:\inetpub\wwwroot /s

EXPOSE 80

CMD while ($true) { Start-Sleep -Seconds 3600 }