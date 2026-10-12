Add-Type -AssemblyName System.Drawing

function New-VkuOcrIcon {
    param(
        [int]$Size,
        [string]$OutPath
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background Gradient (VKU Navy to Sky Blue)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $c1 = [System.Drawing.Color]::FromArgb(255, 15, 23, 42)
    $c2 = [System.Drawing.Color]::FromArgb(255, 2, 132, 199)
    $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
    $g.FillRectangle($brushBg, $rect)

    # White Receipt Card in Center
    $cardW = [int]($Size * 0.54)
    $cardH = [int]($Size * 0.62)
    $cardX = [int](($Size - $cardW) / 2)
    $cardY = [int]($Size * 0.14)
    $cardRect = New-Object System.Drawing.Rectangle($cardX, $cardY, $cardW, $cardH)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.FillRectangle($whiteBrush, $cardRect)

    # Receipt Header Bar (VKU Sky Blue)
    $hdrH = [int]($cardH * 0.22)
    $hdrRect = New-Object System.Drawing.Rectangle($cardX, $cardY, $cardW, $hdrH)
    $hdrBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 2, 132, 199))
    $g.FillRectangle($hdrBrush, $hdrRect)

    # Receipt Text Lines
    $lineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
    $lineX = $cardX + [int]($cardW * 0.14)
    $lineW = [int]($cardW * 0.72)
    $lineH = [Math]::Max(3, [int]($Size * 0.03))
    $g.FillRectangle($lineBrush, $lineX, $cardY + [int]($cardH * 0.34), $lineW, $lineH)
    $g.FillRectangle($lineBrush, $lineX, $cardY + [int]($cardH * 0.48), [int]($lineW * 0.8), $lineH)
    $g.FillRectangle($lineBrush, $lineX, $cardY + [int]($cardH * 0.62), $lineW, $lineH)

    # AI Laser Scan Line across receipt
    $laserPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 16, 185, 129), [Math]::Max(3, [int]($Size * 0.035)))
    $laserY = $cardY + [int]($cardH * 0.52)
    $g.DrawLine($laserPen, [int]($Size * 0.14), $laserY, [int]($Size * 0.86), $laserY)

    # Bottom "VKU OCR" Label
    $fontSize = [Math]::Max(8, [int]($Size * 0.11))
    $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textRect = New-Object System.Drawing.RectangleF(0, [float]($Size * 0.78), [float]$Size, [float]($Size * 0.18))
    $g.DrawString("VKU OCR", $font, $whiteBrush, $textRect, $sf)

    $dir = Split-Path -Parent $OutPath
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
}

New-VkuOcrIcon -Size 192 -OutPath "$PSScriptRoot\web\icons\icon-192.png"
New-VkuOcrIcon -Size 512 -OutPath "$PSScriptRoot\web\icons\icon-512.png"
New-VkuOcrIcon -Size 180 -OutPath "$PSScriptRoot\web\icons\apple-touch-icon.png"
New-VkuOcrIcon -Size 64  -OutPath "$PSScriptRoot\web\favicon.png"
Write-Host "Generated VKU OCR icons successfully!"
