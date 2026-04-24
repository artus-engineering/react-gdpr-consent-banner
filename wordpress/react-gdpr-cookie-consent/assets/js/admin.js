;(function ($) {
    'use strict'

    $(function () {
        // --- Reiter ---
        $('.rgcc-tab-link').on('click', function (e) {
            e.preventDefault()
            const target = $(this).attr('href')
            if (!target) {
                return
            }

            $('.rgcc-tab-link').removeClass('active')
            $(this).addClass('active')
            $('.rgcc-tab-panel').removeClass('active')
            $(target).addClass('active')
        })

        // Tab aus URL-Hash wiederherstellen
        if (window.location.hash && $(window.location.hash).hasClass('rgcc-tab-panel')) {
            $('.rgcc-tab-link[href="' + window.location.hash + '"]').trigger('click')
        }

        // --- Farbauswahl ---
        $('.rgcc-color-picker').wpColorPicker({
            change: function () {
                $('#rgcc_theme_preset').val('custom')
            }
        })

        // Design-Vorlage wechseln
        $('#rgcc_theme_preset').on('change', function () {
            const $selected = $(this).find('option:selected')
            if ($selected.val() === 'custom') {
                return
            }

            const dataKeys = {
                bg_primary: 'bg-primary',
                bg_secondary: 'bg-secondary',
                text_primary: 'text-primary',
                text_secondary: 'text-secondary',
                primary_color: 'primary-color',
                button_text: 'button-text'
            }

            $.each(dataKeys, function (field, dataKey) {
                const color = $selected.data(dataKey)
                if (color) {
                    const $input = $('#rgcc_theme_' + field)
                    $input.val(color)
                    $input.wpColorPicker('color', color)
                }
            })
        })

        // --- Anbieter verwalten ---
        let providerIndex = $('#rgcc-providers-list .rgcc-provider-group').length

        // Anbieterdetails umschalten
        $(document).on('click', '.rgcc-toggle-provider', function () {
            const $body = $(this).closest('.rgcc-provider-group').find('.rgcc-provider-body')
            $body.slideToggle(200)
            $(this).text($body.is(':visible') ? 'Einklappen' : 'Aufklappen')
        })

        // Anbietertitel bei Namensänderung aktualisieren
        $(document).on('input', '.rgcc-provider-name-input', function () {
            const val = $(this).val() || 'Neuer Anbieter'
            $(this).closest('.rgcc-provider-group').find('.rgcc-provider-title').text(val)
        })

        // Anbieter hinzufügen
        $('#rgcc-add-provider').on('click', function () {
            let html = $('#rgcc-provider-template').html() || ''
            html = html.replace(/__INDEX__/g, providerIndex)
            const $group = $(html)
            $group.find('.rgcc-provider-body').show()
            $('#rgcc-providers-list').append($group)
            providerIndex++
        })

        // Anbieter entfernen
        $(document).on('click', '.rgcc-remove-provider', function () {
            $(this).closest('.rgcc-provider-group').remove()
        })

        // --- Cookies verwalten ---
        $(document).on('click', '.rgcc-add-cookie', function () {
            const $provider = $(this).closest('.rgcc-provider-group')
            const pIdx = $provider.data('index')
            const $list = $provider.find('.rgcc-cookies-list')
            const cIdx = $list.children().length

            let html = $('#rgcc-cookie-template').html() || ''
            html = html.replace(/__PIDX__/g, pIdx)
            html = html.replace(/__CIDX__/g, cIdx)
            $list.append(html)
        })

        // Cookie entfernen
        $(document).on('click', '.rgcc-remove-cookie', function () {
            $(this).closest('.rgcc-cookie-row').remove()
        })
    })
})(window.jQuery)
