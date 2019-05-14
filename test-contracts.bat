@echo off
for %%i in (.\\test\\contracts\\*.test.js) do call set "filelist=%%filelist%% %%i"
yarn truffle test %filelist% %*
